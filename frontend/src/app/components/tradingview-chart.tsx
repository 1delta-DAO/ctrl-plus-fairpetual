import { memo, useEffect, useRef } from 'react';

function TradingViewChart() {
  const container = useRef<HTMLInputElement>(null)

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "MEXC:AZEROUSDT",
          "interval": "240",
          "height": "500",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "save_image": false,
          "support_host": "https://www.tradingview.com"
        }`;
      // @ts-ignore
      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container bg-violet-950 rounded rounded-t-none" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }} />
    </div>
  );
}

export default memo(TradingViewChart);