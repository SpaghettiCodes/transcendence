const PIECHART_lossColor = 'rgba(255, 26, 104, 0.2)';
const PIECHART_winColor = 'rgba(54, 162, 235, 0.2)';
const PIECHART_lossBorder = 'rgba(255, 26, 104, 1)';
const PIECHART_winBorder = 'rgba(54, 162, 235, 1)';

export default function drawPieChartData (canvasElement, {
	labels,
	rawData,
	id,
	gameName
}) {
	const data = {
		labels: labels,
		datasets: [{
			data: rawData,
			backgroundColor: [
				PIECHART_lossColor,
				PIECHART_winColor
			],
			borderColor: [
				PIECHART_lossBorder,
				PIECHART_winBorder
			],
			borderWidth: 1,
			cutout: '65%'
		}]
	};

	const ratio = {
		id: id,
		beforeDatasetsDraw(chart, args, plugins) {
			const { data, ctx } = chart;
			const xCenter = chart.getDatasetMeta(0).data[0].x;
			const yCenter = chart.getDatasetMeta(0).data[0].y;
			const ratio = ((data.datasets[0].data[1] / (data.datasets[0].data[1] + data.datasets[0].data[0])) * 100).toFixed(0);
			ctx.save();
			ctx.font = 'bold 25px sans-serif';
			ctx.fillStyle = 'lightgray';
			ctx.textAlign = 'center';
			ctx.fillText(gameName, xCenter, 50)
			ctx.translate(xCenter, yCenter);
			if (isNaN(ratio)) {
				ctx.font = 'bold 25px sans-serif';
				ctx.fillStyle = 'lightgray';
				ctx.textBaseline = 'bottom';
				ctx.textAlign = 'center';
				ctx.fillText('No Games Played', 0, 0 + 15)
			} else {
				ctx.font = 'bold 25px sans-serif';
				ctx.fillStyle = 'lightgray';
				ctx.textBaseline = 'bottom';
				ctx.textAlign = 'center';
				ctx.fillText('Won', 0, 0 - 5)
				ctx.font = 'bold 30px sans-serif';
				ctx.fillStyle = 'lightgray';
				ctx.textBaseline = 'top';
				ctx.textAlign = 'center';
				ctx.fillText(`${ratio}%`, 0, 0);
			}
			ctx.restore();
			ctx.font = 'bold 25px sans-serif';
			ctx.fillStyle = 'lightgray';
			ctx.textAlign = 'center';
			ctx.fillText(`${(data.datasets[0].data[1] + data.datasets[0].data[0])} Games`, xCenter, yCenter + 120)
		}
	};

	const config = {
		type: 'doughnut',
		data: data,
		options: {
			layout: {
				padding: 60,
			},
			plugins: {
				legend: {
					display: false,
				}
			}
		},
		plugins: [ratio],
	};

	const myChart = new Chart(
		canvasElement,
		config
	);
}