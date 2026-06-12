import os
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SIDECAR_TOKEN = os.environ.get("MT5_SIDECAR_TOKEN", "")
MT5_TERMINAL_PATH = os.environ.get("MT5_TERMINAL_PATH", "")

_lock = asyncio.Lock()

try:
    from mt5linux import MetaTrader5
    mt5 = MetaTrader5()
except ImportError as exc:
    logger.error("mt5linux is not installed: %s", exc)
    raise

DEAL_TYPE_BUY = 0
DEAL_TYPE_SELL = 1
DEAL_ENTRY_IN = 0
DEAL_ENTRY_OUT = 1
DEAL_ENTRY_INOUT = 2
DEAL_ENTRY_OUT_BY = 3

app = FastAPI(title="MT5 Sidecar", version="1.0.0")


def _verify_token(token: Optional[str]) -> None:
    if SIDECAR_TOKEN and token != SIDECAR_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _shutdown_safe() -> None:
    try:
        mt5.shutdown()
    except Exception:
        pass


class ValidateRequest(BaseModel):
    login: int
    password: str
    server: str


class DealsRequest(BaseModel):
    login: int
    password: str
    server: str
    from_date: str
    to_date: str


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/validate")
async def validate(
    req: ValidateRequest,
    x_sidecar_token: Optional[str] = Header(None),
) -> Dict[str, Any]:
    _verify_token(x_sidecar_token)
    async with _lock:
        try:
            kwargs: Dict[str, Any] = {}
            if MT5_TERMINAL_PATH:
                kwargs["path"] = MT5_TERMINAL_PATH
            if not mt5.initialize(**kwargs):
                return {"valid": False, "error": f"MT5 initialization failed: {mt5.last_error()}"}

            if not mt5.login(req.login, password=req.password, server=req.server):
                error = mt5.last_error()
                _shutdown_safe()
                return {"valid": False, "error": f"Login failed: {error}"}

            _shutdown_safe()
            logger.info("Validated MT5 account %s@%s", req.login, req.server)
            return {"valid": True}
        except Exception as exc:
            _shutdown_safe()
            return {"valid": False, "error": str(exc)}


@app.post("/deals")
async def deals(
    req: DealsRequest,
    x_sidecar_token: Optional[str] = Header(None),
) -> Dict[str, Any]:
    _verify_token(x_sidecar_token)
    async with _lock:
        try:
            kwargs: Dict[str, Any] = {}
            if MT5_TERMINAL_PATH:
                kwargs["path"] = MT5_TERMINAL_PATH
            if not mt5.initialize(**kwargs):
                raise HTTPException(
                    status_code=503,
                    detail=f"MT5 initialization failed: {mt5.last_error()}",
                )

            if not mt5.login(req.login, password=req.password, server=req.server):
                error = mt5.last_error()
                _shutdown_safe()
                raise HTTPException(status_code=401, detail=f"Login failed: {error}")

            account = mt5.account_info()
            currency = account.currency if account else "USD"

            from_dt = datetime.fromisoformat(req.from_date.replace("Z", "+00:00"))
            to_dt = datetime.fromisoformat(req.to_date.replace("Z", "+00:00"))

            raw = mt5.history_deals_get(from_dt, to_dt)
            _shutdown_safe()

            if raw is None:
                return {"trades": []}

            trades = _group_deals(list(raw), currency)
            logger.info("Synced %s trades for %s@%s", len(trades), req.login, req.server)
            return {"trades": trades}
        except HTTPException:
            raise
        except Exception as exc:
            _shutdown_safe()
            raise HTTPException(status_code=500, detail=str(exc)) from exc


def _group_deals(raw_deals: list, currency: str) -> List[Dict[str, Any]]:
    trading = [d for d in raw_deals if d.type in (DEAL_TYPE_BUY, DEAL_TYPE_SELL)]

    positions: Dict[int, list] = {}
    for deal in trading:
        positions.setdefault(int(deal.position_id), []).append(deal)

    trades: List[Dict[str, Any]] = []
    for position_id, pos_deals in positions.items():
        in_deals = [d for d in pos_deals if d.entry == DEAL_ENTRY_IN]
        out_deals = [
            d for d in pos_deals
            if d.entry in (DEAL_ENTRY_OUT, DEAL_ENTRY_INOUT, DEAL_ENTRY_OUT_BY)
        ]

        if not in_deals or not out_deals:
            continue

        in_deal = min(in_deals, key=lambda d: d.time)
        out_deal = max(out_deals, key=lambda d: d.time)

        direction = "BUY" if in_deal.type == DEAL_TYPE_BUY else "SELL"
        total_commission = sum(d.commission for d in pos_deals)
        total_swap = sum(d.swap for d in pos_deals)
        total_profit = sum(d.profit for d in pos_deals)
        fees = total_commission + total_swap
        net_pnl = total_profit
        gross_pnl = net_pnl + fees

        trades.append({
            "sourcePositionId": str(position_id),
            "symbol": in_deal.symbol,
            "direction": direction,
            "entryPrice": float(in_deal.price),
            "exitPrice": float(out_deal.price),
            "quantity": float(in_deal.volume),
            "grossPnL": round(gross_pnl, 5),
            "fees": round(fees, 5),
            "netPnL": round(net_pnl, 5),
            "openTime": datetime.fromtimestamp(in_deal.time, tz=timezone.utc)
                               .isoformat()
                               .replace("+00:00", "Z"),
            "closeTime": datetime.fromtimestamp(out_deal.time, tz=timezone.utc)
                                .isoformat()
                                .replace("+00:00", "Z"),
            "currency": currency,
        })

    return trades
