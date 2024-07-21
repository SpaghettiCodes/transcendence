import { redirect } from "../router.js"

export default function template(prop={}) {
	// attach all pre-rendering code here (like idk, fetch request or something)
	let prerender = () => {
		return true // return true to continue to render_code
		// return false to abort (usually used with redirect)
	}

	// return the html code here
	let render_code = () => {
		return `
        <div class="video-container">
            <video autoplay muted loop id="bg-video">
                <source src="video/among_us.mp4" type="video/mp4">
                Your browser does not support HTML5 video.
            </video>
        </div>
        <div class="container text-white text-center">
            <h1 class="title">Employee Infos</h1>
        </div>
        <div class="text-white">
            <div class="profile p-4">
                <div class="profile-info">
                    <img src="bocchi.jpeg" alt="Profile Picture" class="profile-pic">
                    <h2 class="mt-3">Username</h2>
                </div>
                <div class="col-md-8 match-history ">
                    <h3>Match History</h3>
                    <div class="tab-content mt-3" id="matchHistoryTabContent">
                        <div class="tab-pane fade show active" id="recent" role="tabpanel" aria-labelledby="recent-tab">
                            <ul class="list-group">
                                <li class="list-group-item">Match 1: Win</li>
                                <li class="list-group-item">Match 2: Loss</li>
                                <li class="list-group-item">Match 3: Win</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="chartArea">
                    <div class="chartBox">
                        <canvas id="myChart1"></canvas>
                    </div>
                    <div class="chartBox">
                        <canvas id="myChart2"></canvas>
                    </div>
                    <div class="chartBox">
                        <canvas id="myChart3"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom-left-buttons">
            <button type="button" class="btn btn-secondary">Change Profile Pic</button>
            <button type="button" class="btn btn-secondary">Change Email</button>
        </div>
    `
	}

	// attach all event listeners here (or do anything that needs to be done AFTER attaching the html code)
	let postrender = () => {
        const data1 = {
            labels: ['Losses', 'Wins'],
            datasets: [{
                data: [43, 25],
                backgroundColor: [
                    'rgba(255, 26, 104, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 26, 104, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                cutout: '60%'
            }]
        };
        const ratio1 = {
            id: 'ratio1',
            beforeDatasetsDraw(chart, args, plugins) {
                const { data, ctx } = chart;
                const xCenter = chart.getDatasetMeta(0).data[0].x;
                const yCenter = chart.getDatasetMeta(0).data[0].y;
                const ratio = ((data.datasets[0].data[1] / (data.datasets[0].data[1] + data.datasets[0].data[0])) * 100).toFixed(0);
                ctx.save();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText('Pong', xCenter, 60)
                ctx.translate(xCenter, yCenter);
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
                ctx.restore();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText(`${(data.datasets[0].data[1] + data.datasets[0].data[0])} Games`, xCenter, yCenter + 140)
            }
        };
        const config1 = {
            type: 'doughnut',
            data: data1,
            options: {
                layout: {
                    padding: 70,
                },
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            },
            plugins: [ratio1],
        };
        const myChart1 = new Chart(
            document.getElementById('myChart1'),
            config1
        );

        const data2 = {
            labels: ['Losses', 'Wins'],
            datasets: [{
                data: [7, 8],
                backgroundColor: [
                    'rgba(255, 26, 104, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 26, 104, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                cutout: '60%'
            }]
        };
        const ratio2 = {
            id: 'ratio',
            beforeDatasetsDraw(chart, args, plugins) {
                const { data, ctx } = chart;
                const xCenter = chart.getDatasetMeta(0).data[0].x;
                const yCenter = chart.getDatasetMeta(0).data[0].y;
                const ratio = ((data.datasets[0].data[1] / (data.datasets[0].data[1] + data.datasets[0].data[0])) * 100).toFixed(0);
                ctx.save();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText('APong', xCenter, 60)
                ctx.translate(xCenter, yCenter);
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
                ctx.restore();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText(`${(data.datasets[0].data[1] + data.datasets[0].data[0])} Games`, xCenter, yCenter + 140)
            }
        };
        const config2 = {
            type: 'doughnut',
            data: data2,
            options: {
                layout: {
                    padding: 70,
                },
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            },
            plugins: [ratio2]
        };
        const myChart2 = new Chart(
            document.getElementById('myChart2'),
            config2
        );

        const data3 = {
            labels: ['Losses', 'Wins'],
            datasets: [{
                data: [3, 3],
                backgroundColor: [
                    'rgba(255, 26, 104, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 26, 104, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                cutout: '60%'
            }]
        };
        const ratio3 = {
            id: 'ratio',
            beforeDatasetsDraw(chart, args, plugins) {
                const { data, ctx } = chart;
                const xCenter = chart.getDatasetMeta(0).data[0].x;
                const yCenter = chart.getDatasetMeta(0).data[0].y;
                const ratio = ((data.datasets[0].data[1] / (data.datasets[0].data[1] + data.datasets[0].data[0])) * 100).toFixed(0);
                ctx.save();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText('Tournament', xCenter, 60)
                ctx.translate(xCenter, yCenter);
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
                ctx.restore();
                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'lightgray';
                ctx.textAlign = 'center';
                ctx.fillText(`${(data.datasets[0].data[1] + data.datasets[0].data[0])} Games`, xCenter, yCenter + 140)
            }
        };
        const config3 = {
            type: 'doughnut',
            data: data3,
            options: {
                layout: {
                    padding: 70,
                },
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            },
            plugins: [ratio3]
        };
        const myChart3 = new Chart(
            document.getElementById('myChart3'),
            config3
        );
	}

	let cleanup = () => {
	}

	return [prerender, render_code, postrender, cleanup]
}
