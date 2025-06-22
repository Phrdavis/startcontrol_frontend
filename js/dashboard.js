function fetchDashboardData() {
    $.ajax({
        url: 'http://localhost:6060/api/dashboard',
        method: 'GET',
        dataType: 'json',
        success: function(data) {

            console.log(data)
            
            $('#dashboard-projetos').text(data.totalProjetos);
            $('#dashboard-startups').text(data.totalStartups);
            $('#dashboard-usuarios-ativos').text(data.usuariosAtivos);
            $('#dashboard-startups-ativas').text(data.startupsAtivas);

            if (data.countProjetosByStatus) {
                renderProjetosStatusChart(data.countProjetosByStatus);
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Erro ao buscar dados do dashboard:', textStatus, errorThrown);
        }
    });
}

// Função para montar o gráfico usando ApexCharts
function renderProjetosStatusChart(countProjetosByStatus) {
    // countProjetosByStatus agora é um array de arrays: [ [status, count], ... ]
    const labels = countProjetosByStatus.map(item => item[0]);
    const series = countProjetosByStatus.map(item => item[1]);

    console.log(labels, series)

    var options = {
        chart: {
            type: 'donut',
            width: 400,
            height: 300
        },
        series: series,
        labels: labels,
        title: {
            text: ''
        },
        legend: {
            position: 'right',
            horizontalAlign: 'left',
            verticalAlign: 'middle', // Alinha verticalmente ao centro
            offsetY: 0
        },
        dataLabels: {
            enabled: false // Não mostra valores em cima do gráfico
        },
        tooltip: {
            enabled: true // Mostra valores ao passar o mouse
        }
    };

    // Destroi o gráfico anterior, se existir
    if (window.projetosStatusChartInstance) {
        window.projetosStatusChartInstance.destroy();
    }

    window.projetosStatusChartInstance = new ApexCharts(document.getElementById("projetosStatusChart"), options);
    window.projetosStatusChartInstance.render();
}

// Exemplo de uso
fetchDashboardData();