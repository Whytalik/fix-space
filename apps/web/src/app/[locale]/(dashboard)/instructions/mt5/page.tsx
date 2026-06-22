"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, Terminal, Settings, Play, AlertTriangle, Check, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";

export default function Mt5InstructionsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isUk = locale === "uk";

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Content translations
  const content = {
    title: isUk ? "Інструкція з інтеграції MetaTrader 5" : "MetaTrader 5 Integration Guide",
    subtitle: isUk
      ? "Покрокове керівництво з налаштування радника FixSpaceSync для автоматичної синхронізації угод"
      : "Step-by-step guide to configure the FixSpaceSync Expert Advisor for automatic trade synchronization",
    backBtn: isUk ? "Назад" : "Back",

    step1Title: isUk ? "1. Завантаження радника" : "1. Download the Expert Advisor",
    step1Desc: isUk
      ? "Завантажте файл радника FixSpaceSync на свій комп'ютер. Цей робот буде відправляти інформацію про закриті угоди з вашого терміналу до системи."
      : "Download the FixSpaceSync Expert Advisor to your computer. This advisor will push closed trades from your MT5 terminal to the platform.",
    downloadBtn: isUk ? "Завантажити FixSpaceSync.mq5" : "Download FixSpaceSync.mq5",

    step2Title: isUk ? "2. Встановлення в термінал MT5" : "2. Install to MetaTrader 5",
    step2DescMac: isUk
      ? "Для macOS (автоматично): Якщо ви використовуєте macOS та стандартну інсталяцію MT5, запустіть цю команду в терміналі вашого проекту для автоматичного копіювання файлу:"
      : "For macOS (automated): If you are running MT5 via Wine/CrossOver, run this command in your project terminal to copy the advisor automatically:",
    step2DescManual: isUk
      ? "Встановлення вручну: У терміналі MT5 перейдіть у File → Open Data Folder. Скопіюйте файл FixSpaceSync.mq5 у папку MQL5/Experts."
      : "Manual installation: In MT5, go to File → Open Data Folder. Copy the FixSpaceSync.mq5 file into the MQL5/Experts directory.",
    copyBtn: isUk ? "Копіювати" : "Copy",
    copied: isUk ? "Скопійовано!" : "Copied!",

    step3Title: isUk ? "3. Дозвіл на WebRequest (Важливо)" : "3. Enable WebRequests (Important)",
    step3Desc: isUk
      ? "Термінал MT5 блокує всі вихідні запити за замовчуванням. Вам потрібно дозволити відправку даних на адресу вашого сервера:"
      : "MT5 blocks external network requests by default. You must whitelist your server URL in the terminal settings:",
    step3Sub1: isUk
      ? "Відкрийте Tools (Сервіс) → Options (Налаштування) → вкладка Expert Advisors (Радники)."
      : "Open Tools → Options → Expert Advisors.",
    step3Sub2: isUk ? "Позначте прапорець Allow WebRequest for listed URL." : "Check Allow WebRequest for listed URL.",
    step3Sub3: isUk
      ? "Позначте прапорець Allow DLL imports (це обов'язково для роботи Wine на macOS)."
      : "Check Allow DLL imports (required for Wine emulator on macOS).",
    step3Sub4: isUk
      ? "Двічі клікніть на порожній рядок внизу списку та вставте туди адресу вашого сервера. Обов'язково натисніть Enter після вставки!"
      : "Double-click the empty row under the whitelist and paste your server's base URL. Press Enter to confirm!",
    warningLocalhost: isUk
      ? "Важливо: MT5 не приймає слово 'localhost' через внутрішній валідатор. Використовуйте IP-адресу 127.0.0.1:"
      : "Important: MT5 URL validator rejects the word 'localhost'. Use loopback IP 127.0.0.1 instead:",

    step4Title: isUk ? "4. Запуск та налаштування на графіку" : "4. Attach to Chart & Configure",
    step4Desc: isUk
      ? "Перетягніть радника FixSpaceSync на будь-який активний графік у терміналі та перейдіть у вкладку Inputs (Параметри):"
      : "Attach the FixSpaceSync advisor to any active chart and fill in the parameters in the Inputs tab:",
    paramUrl: isUk ? "Webhook API URL (адреса вебхуку з префіксом /api)" : "Webhook API URL (webhook address with /api prefix)",
    paramConnId: isUk ? "Connection ID (ідентифікатор підключення)" : "Connection ID (unique connection identifier)",
    paramToken: isUk ? "API Token (секретний токен підключення)" : "API Token (secret connection token)",
    paramDays: isUk ? "Sync Days (глибина синхронізації історії, дефолт 180)" : "Sync Days (depth of history sync in days, default 180)",
    step4Note: isUk
      ? "Переконайтеся, що кнопка Algo Trading на верхній панелі MT5 світиться зеленим кольором."
      : "Ensure the Algo Trading button in the top toolbar of MT5 is enabled (green).",

    troubleshootingTitle: isUk ? "Вирішення можливих проблем" : "Troubleshooting",
    err4014Title: isUk ? "Помилка WebRequest failed. Error: 4014" : "WebRequest failed. Error: 4014",
    err4014Desc: isUk
      ? "Виникає, коли термінал заблокував запит. Перевірте, чи дозволено WebRequest у налаштуваннях та чи вірно вказано домен (має бути 127.0.0.1 замість localhost). Також переконайтеся, що ви не намагаєтеся запустити радника в Тестері Стратегій, оскільки WebRequests там заблоковані самою платформою."
      : "Occurs when the terminal blocks the request. Double-check that WebRequests are enabled and the domain is correct (must use 127.0.0.1 instead of localhost). Also note that WebRequests are completely blocked inside the Strategy Tester by MetaTrader.",
    err404Title: isUk ? "Помилка 404 (Cannot POST ...)" : "Error 404 (Cannot POST ...)",
    err404Desc: isUk
      ? "Перевірте правильність написання InpApiUrl. Якщо запит іде на порт 3000, шлях має бути без /api (наприклад, http://127.0.0.1:3000/integration-connections/mt5/webhook). Якщо на порт 3001, то з /api. Також перевірте, чи не залишилося випадкових пробілів (%20) наприкінці посилання."
      : "Double-check your InpApiUrl. If sending to port 3000, omit /api (e.g. http://127.0.0.1:3000/integration-connections/mt5/webhook). If port 3001, include /api. Ensure there are no trailing space characters (%20) at the end of the URL.",
  };

  const localHostUrl = "http://127.0.0.1:3001/api/integration-connections/mt5/webhook";

  return (
    <div className="flex-1 overflow-y-auto scrollbar bg-canvas px-8 py-10 animate-fade-up">
      <div className="space-y-8 pb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{content.title}</h1>
          <p className="text-sm text-ink-muted">{content.subtitle}</p>
        </div>

        <div className="grid gap-8">
          {/* Step 1 */}
          <div className="rounded-2xl border border-stroke bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-ink">{content.step1Title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{content.step1Desc}</p>
                <a href="/FixSpaceSync.mq5" download>
                  <Button variant="primary" className="flex items-center gap-2 mt-2">
                    <Download className="h-4 w-4" />
                    {content.downloadBtn}
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-stroke bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-ink">{content.step2Title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{content.step2DescMac}</p>

                <div className="relative flex items-center bg-canvas rounded-lg border border-stroke p-3">
                  <code className="flex-1 text-xs font-mono text-ink overflow-x-auto break-all pr-12">pnpm install:bot</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 shrink-0"
                    onClick={() => handleCopy("pnpm install:bot", "cmd")}
                  >
                    {copiedText === "cmd" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <p className="text-sm text-ink-muted leading-relaxed">{content.step2DescManual}</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-stroke bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-ink">{content.step3Title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{content.step3Desc}</p>

                <ul className="list-decimal pl-5 text-sm text-ink-muted space-y-2 leading-relaxed">
                  <li>{content.step3Sub1}</li>
                  <li>{content.step3Sub2}</li>
                  <li>{content.step3Sub3}</li>
                  <li>
                    {content.step3Sub4}
                    <div className="mt-3 p-3 bg-warning-bg border border-warning rounded-lg text-xs text-ink-muted space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {content.warningLocalhost}
                      </div>
                      <div className="relative flex items-center bg-canvas border border-stroke rounded-lg p-2 mt-1">
                        <code className="flex-1 font-mono text-xs pr-10">http://127.0.0.1:3001</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1"
                          onClick={() => handleCopy("http://127.0.0.1:3001", "url-whitelist")}
                        >
                          {copiedText === "url-whitelist" ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-stroke bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <Play className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-ink">{content.step4Title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{content.step4Desc}</p>

                <div className="bg-canvas border border-stroke rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-ink">InpApiUrl</span>
                    <span className="text-ink-muted">{content.paramUrl}</span>
                    <div className="relative flex items-center bg-surface border border-stroke rounded-lg p-2">
                      <code className="flex-1 font-mono text-ink-muted break-all pr-10">{localHostUrl}</code>
                      <Button variant="ghost" size="sm" className="absolute right-1" onClick={() => handleCopy(localHostUrl, "full-url")}>
                        {copiedText === "full-url" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-stroke-subtle pt-2">
                    <span className="font-semibold text-ink">InpConnectionId</span>
                    <span className="text-ink-muted">{content.paramConnId}</span>
                  </div>

                  <div className="flex justify-between border-t border-stroke-subtle pt-2">
                    <span className="font-semibold text-ink text-warning">InpApiToken</span>
                    <span className="text-ink-muted">{content.paramToken}</span>
                  </div>

                  <div className="flex justify-between border-t border-stroke-subtle pt-2">
                    <span className="font-semibold text-ink">InpSyncDays</span>
                    <span className="text-ink-muted">{content.paramDays}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-accent-muted border border-accent-muted rounded-lg text-xs text-ink-muted">
                  <Info className="h-4 w-4 text-accent shrink-0" />
                  <span>{content.step4Note}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="rounded-2xl border border-stroke bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2 border-b border-stroke pb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {content.troubleshootingTitle}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <h4 className="font-bold text-ink">{content.err4014Title}</h4>
                <p className="text-ink-muted leading-relaxed text-xs">{content.err4014Desc}</p>
              </div>

              <div className="space-y-1.5 border-t border-stroke-subtle pt-4">
                <h4 className="font-bold text-ink">{content.err404Title}</h4>
                <p className="text-ink-muted leading-relaxed text-xs">{content.err404Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
