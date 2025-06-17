$(document).ready(function () {
    const $container = $('<div class="container mt-4"></div>');
    $('#startups-container').append($container);

    $.get('http://localhost:6060/api/startups')
        .done(function (data) {
            const $row = $('<div class="row g-4"></div>');

            data.forEach(function (startup) {
                const ativoBadge = startup.ativo
                    ? '<span class="ms-2 me-3 mt-3 badge-startup-success badge-startup rounded-circle"></span>'
                    : '<span class="ms-2 me-3 mt-3 badge-startup-danger badge-startup rounded-circle"></span>';

                const $col = $(`
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-lg border-0 rounded-4 transition-transform" style="transition: transform 0.2s;">
                            <div class="card-header bg-gradient bg-dark text-white rounded-top-4 d-flex align-items-center justify-content-between">
                                
                                <h5 class="mb-2 fw-bold">${ativoBadge}${startup.nome || 'Sem nome'}</h5>
                                <div class="dropdown ms-2">
                                    <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item fw-bolder" href="#">Ver Startup</a></li>
                                        <li><a class="dropdown-item fw-bolder" href="#">Atualizar</a></li>
                                        <hr>
                                        <li><a class="dropdown-item fw-bolder text-danger" href="#">Excluir</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <div class="mb-3">
                                    <span class="text-muted small"><i class="bi bi-briefcase"></i> Área:</span>
                                    <span class="fw-semibold">${startup.areaAtuacao || 'Não informada'}</span>
                                </div>
                                <div class="mb-3">
                                    <span class="text-muted small"><i class="bi bi-upc-scan"></i> CNPJ:</span>
                                    <span class="fw-semibold cpf">${startup.cnpj || 'Não informado'}</span>
                                </div>
                                <hr>
                                <div class="mb-2">
                                    <span class="text-muted small"><i class="bi bi-person-circle"></i> Responsável:</span>
                                    <span class="fw-semibold">${startup.responsavel?.nome || 'Não informado'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                // Efeito hover moderno
                $col.find('.card').hover(
                    function () { $(this).css('transform', 'scale(1.03)'); },
                    function () { $(this).css('transform', 'scale(1)'); }
                );
                $row.append($col);
            });

            $container.append($row);
        })
        .fail(function () {
            $container.html('<div class="alert alert-danger">Erro ao carregar startups.</div>');
        });

        $('#search-startup-input').on('input', function () {
            const search = $(this).val().toLowerCase();
            $('#startups-container .card').each(function () {
                const nome = $(this).find('h5').text().toLowerCase();
                const cpf = $(this).find('.card-body div .cpf').text().toLowerCase();
                if (nome.includes(search) || cpf.includes(search)) {
                    $(this).closest('.col-md-6, .col-lg-4').show();
                } else {
                    $(this).closest('.col-md-6, .col-lg-4').hide();
                }
            });
        });
});
