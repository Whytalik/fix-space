//+------------------------------------------------------------------+
//|                                                 FixSpaceSync.mq5 |
//|                                  Copyright 2026, Fix Space Corp. |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Fix Space Corp."
#property version   "1.00"
#property description "Expert Advisor to sync trading history to Fix Space via Webhook"
#property strict

//--- Input parameters
input string   InpApiUrl      = "https://your-api.railway.app/api/integration-connections/mt5/webhook"; // API Webhook URL
input string   InpConnectionId = ""; // Fix Space Connection ID
input string   InpApiToken    = ""; // Fix Space API Token
input int      InpSyncTimer   = 30; // Sync interval in seconds
input int      InpSyncDays    = 180; // Initial sync depth in days

//--- Global variables
datetime lastSyncTime = 0;

//+------------------------------------------------------------------+
//| Helper to create JSON strings manually (avoiding JAson dependency)|
//+------------------------------------------------------------------+
string StringEscape(string str)
{
   StringReplace(str, "\\", "\\\\");
   StringReplace(str, "\"", "\\\"");
   StringReplace(str, "\n", "\\n");
   StringReplace(str, "\r", "\\r");
   StringReplace(str, "\t", "\\t");
   return str;
}

string FormatDate(datetime time)
{
   // Format: YYYY-MM-DDTHH:MM:SSZ
   MqlDateTime dt;
   TimeToStruct(time, dt);
   return StringFormat("%04d-%02d-%02dT%02d:%02d:%02dZ", dt.year, dt.mon, dt.day, dt.hour, dt.min, dt.sec);
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(InpConnectionId == "" || InpApiToken == "")
   {
      Print("Error: Connection ID and API Token are required.");
      return(INIT_FAILED);
   }

   // Initially, get deals from the last N days to seed the backend.
   lastSyncTime = TimeCurrent() - (InpSyncDays * 24 * 60 * 60);

   EventSetTimer(InpSyncTimer);
   Print("FixSpaceSync initialized. Syncing every ", InpSyncTimer, " seconds.");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("FixSpaceSync deinitialized.");
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncTrades();
}

//+------------------------------------------------------------------+
//| Main sync logic                                                  |
//+------------------------------------------------------------------+
void SyncTrades()
{
   datetime currentTime = TimeCurrent();
   
   // Select history from lastSyncTime to now
   if(!HistorySelect(lastSyncTime, currentTime))
   {
      Print("Failed to select history. Error: ", GetLastError());
      return;
   }

   int totalDeals = HistoryDealsTotal();
   if(totalDeals == 0)
      return; // Nothing to sync

   string tradesJson = "[";
   int validTradesCount = 0;

   // Grouping deals into trades is complex in pure MQL5 without a library.
   // Here we iterate through closed positions (by iterating deals with DEAL_ENTRY_OUT).
   for(int i = 0; i < totalDeals; i++)
   {
      ulong outTicket = HistoryDealGetTicket(i);
      if(outTicket == 0) continue;

      long entry = HistoryDealGetInteger(outTicket, DEAL_ENTRY);
      
      // We only care about deals that close a position
      if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT || entry == DEAL_ENTRY_OUT_BY)
      {
         long positionId = HistoryDealGetInteger(outTicket, DEAL_POSITION_ID);
         
         // Select the history for this specific position
         if(HistorySelectByPosition(positionId))
         {
            int posDealsTotal = HistoryDealsTotal();
            if(posDealsTotal < 2) continue; // Need at least an IN and an OUT deal
            
            ulong inTicket = 0;
            double totalProfit = 0;
            double totalCommission = 0;
            double totalSwap = 0;
            
            // Find the IN deal and accumulate metrics
            for(int j = 0; j < posDealsTotal; j++)
            {
               ulong ticket = HistoryDealGetTicket(j);
               if(HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN)
               {
                  if(inTicket == 0 || HistoryDealGetInteger(ticket, DEAL_TIME) < HistoryDealGetInteger(inTicket, DEAL_TIME))
                     inTicket = ticket; // Get the earliest IN deal
               }
               
               totalProfit += HistoryDealGetDouble(ticket, DEAL_PROFIT);
               totalCommission += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
               totalSwap += HistoryDealGetDouble(ticket, DEAL_SWAP);
            }
            
            if(inTicket == 0) continue; // Position was likely opened before our history period
            
            long type = HistoryDealGetInteger(inTicket, DEAL_TYPE);
            if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL) continue;
            
            string direction = (type == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            string symbol = HistoryDealGetString(inTicket, DEAL_SYMBOL);
            double entryPrice = HistoryDealGetDouble(inTicket, DEAL_PRICE);
            double exitPrice = HistoryDealGetDouble(outTicket, DEAL_PRICE);
            double volume = HistoryDealGetDouble(inTicket, DEAL_VOLUME);
            
            datetime openTime = (datetime)HistoryDealGetInteger(inTicket, DEAL_TIME);
            datetime closeTime = (datetime)HistoryDealGetInteger(outTicket, DEAL_TIME);
            
            double fees = totalCommission + totalSwap;
            double netPnL = totalProfit;
            double grossPnL = netPnL + fees;
            string currency = AccountInfoString(ACCOUNT_CURRENCY);

            // Construct JSON for this trade
            string tradeObj = StringFormat(
               "{\"sourcePositionId\":\"%I64d\",\"symbol\":\"%s\",\"direction\":\"%s\",\"entryPrice\":%.5f,\"exitPrice\":%.5f,\"quantity\":%.2f,\"grossPnL\":%.5f,\"fees\":%.5f,\"netPnL\":%.5f,\"openTime\":\"%s\",\"closeTime\":\"%s\",\"currency\":\"%s\"}",
               positionId, StringEscape(symbol), direction, entryPrice, exitPrice, volume, grossPnL, fees, netPnL, FormatDate(openTime), FormatDate(closeTime), StringEscape(currency)
            );

            if(validTradesCount > 0) tradesJson += ",";
            tradesJson += tradeObj;
            validTradesCount++;
         }
      }
   }
   
   tradesJson += "]";

   if(validTradesCount > 0)
   {
      string payload = StringFormat("{\"connectionId\":\"%s\",\"trades\":%s}", StringEscape(InpConnectionId), tradesJson);
      
      if(SendWebhook(payload))
      {
         lastSyncTime = currentTime; // Update sync time only on success
         Print("Successfully synced ", validTradesCount, " trades.");
      }
   }
}

//+------------------------------------------------------------------+
//| Send HTTP POST Request                                           |
//+------------------------------------------------------------------+
bool SendWebhook(string payload)
{
   char data[];
   char result[];
   string result_headers;
   
   // Convert payload to UTF-8 char array. Subtract 1 to remove null terminator.
   ArrayResize(data, StringToCharArray(payload, data, 0, WHOLE_ARRAY, CP_UTF8) - 1);

   string headers = StringFormat("Content-Type: application/json\r\nx-api-key: %s\r\n", InpApiToken);
   
   ResetLastError();
   int res = WebRequest("POST", InpApiUrl, headers, 10000, data, result, result_headers);
   
   if(res == -1)
   {
      int err = GetLastError();
      Print("WebRequest failed. Error: ", err);
      if(err == 4060)
         Print("Ensure '", InpApiUrl, "' is added to Tools -> Options -> Expert Advisors -> Allowed URLs.");
      return false;
   }
   else if(res >= 200 && res < 300)
   {
      return true;
   }
   else
   {
      string respText = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
      Print("Server returned error ", res, ": ", respText);
      return false;
   }
}
