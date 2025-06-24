$(document).ready(function () {

    const alertPlaceholder = document.getElementById('alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    const $container = $('<div class="mx-0 mt-4"></div>');
    $('#incubadoras-container').append($container);

    // Recupera o usuário logado do localStorage
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    const usuarioId = usuario && usuario.id ? usuario.id : null;

    
    $.get(`http://localhost:6060/api/incubadoras?usuarioId=${usuarioId}`)
        .done(function (data) {
            const $row = $('<div class="row w-100 g-1 justify-content-between"></div>');

            data.forEach(function (incubadora) {
                console.log(incubadora)

                const $col = $(`
                    
                    <div class="col-xxl-3 col-xl-4 col-md-6 p-2">
                        <div class="card incubadora-card">
                            <div class="incubadora-card-header position-relative">
                                <i class="text-${incubadora.color || 'primary'} ${incubadora.icon || 'bi bi-briefcase'}"></i>
                                <h4>${incubadora.nome || 'Sem nome'}</h4>
                                <input type="hidden" class="incubadora-id-input" value="${incubadora.id}">
                                <span class="tag bg-opacity-25 bg-${incubadora.color || 'danger'} text-${incubadora.color || 'danger'}">
                                    ${incubadora.tag || 'N/A'}
                                </span>
                            </div>

                            <!-- Corpo do Card -->
                            <div class="incubadora-card-body text-center">
                                <p>${incubadora.descricao || 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                `);

                $col.find('.card').hover(
                    function () { $(this).css('transform', 'scale(1.03)'); },
                    function () { $(this).css('transform', 'scale(1)'); }
                );
                $row.append($col);
            });

            $container.append($row);
        })
        .fail(function () {
            $container.html('<div class="alert alert-danger">Erro ao carregar incubadoras.</div>');
        });

})