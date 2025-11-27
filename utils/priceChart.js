// utils/priceChart.js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 1200;
const height = 600;

const chartNode = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: 'transparent',
});

async function createPriceChart(data, label) {
  // 날짜 오름차순 (가장 오래된 → 최신)
  const sorted = [...data].reverse();

  const labels = sorted.map((d) => d.date);

  // 가격 → 만 단위 변환
  const prices = sorted.map((d) => {
    const raw = Number(String(d.price).replace(/,/g, ''));
    return Math.round(raw / 10000); // 만 단위
  });

  const volumes = sorted.map((d) =>
    Number(String(d.volume).replace(/[^0-9]/g, ''))
  );

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        // 거래량 (왼쪽)
        {
          type: 'bar',
          label: `${label} 거래량`,
          data: volumes,
          backgroundColor: 'rgba(180, 0, 255, 0.35)',
          borderColor: 'rgba(180, 0, 255, 0.8)',
          borderWidth: 1,
          yAxisID: 'y1',
        },

        // 가격 (오른쪽)
        {
          type: 'line',
          label: `${label} 가격(만)`,
          data: prices,
          borderColor: '#0090ff',
          backgroundColor: 'rgba(0,144,255,0.25)',
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 3,
          yAxisID: 'y2',
        },
      ],
    },

    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 18 },
          },
        },
      },
      scales: {
        y1: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (v) => `${v.toLocaleString()}개`,
            color: '#b000ff',
            font: { size: 14 },
          },
        },
        y2: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            callback: (v) => `${v.toLocaleString()}만`,
            color: '#0090ff',
            font: { size: 14 },
          },
        },
        x: {
          ticks: { font: { size: 14 } },
        },
      },
    },
  };

  return await chartNode.renderToBuffer(config, 'image/png');
}

module.exports = { createPriceChart };
