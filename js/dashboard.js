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

            if(data.incubadoras){
                renderCardsIncubadoras(data.incubadoras)                
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

function renderCardsIncubadoras(incubadoras){

    incubadoras.forEach(data => {

        var card =  `<div class="col-md-4 col-xl-3">
                        <div class="dashboard-card card bg-c-blue order-card">
                            <div class="card-block row m-0 justify-content-start align-items-center p-5 pe-3">
                                <div class="col-xl-4">
                                    <i class="card-icon display-5 me-5 ${data.icon} text-${data.color}"></i>
                                </div>
                                <div class="col-xl-8 text-start incubadora">
                                    <h3 class="m-b-20 nome">${data.nome}</h3>
                                    <span class="startups fw-bold bg-${data.color} bg-opacity-25 text-${data.color} text-center rounded-pill px-3 py-1">${data.totalStartups} Startups</span>
                                    <p class="descricao mt-3">${limitarTexto(data.descricao)}</p>
                                    <p class="tag fw-bold">${data.tag}</p>
                                </div>
                            </div>
                        </div>
                    </div>`
        
        $('.incubadoras-container').append(card)
    });

}


function limitarTexto(texto) {
    var limit = 25
    if (typeof texto !== 'string') return '';
    return texto.length > limit ? texto.slice(0, limit) + '...' : texto;
}

// Exemplo de uso
fetchDashboardData();