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

    const $container = $('<div class="container mt-4"></div>');
    $('#startups-container').append($container);

    // Recupera o usuário logado do localStorage
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    const usuarioId = usuario && usuario.id ? usuario.id : null;

    $.get(`http://localhost:6060/api/startups?usuarioId=${usuarioId}`)
        .done(function (data) {
            const $row = $('<div class="row g-4"></div>');

            data.forEach(function (startup) {
                const ativoBadge = startup.ativo
                    ? '<span class="ms-2 me-2 badge-startup-success badge-startup rounded-circle"></span>'
                    : '<span class="ms-2 me-2 badge-startup-danger badge-startup rounded-circle"></span>';

                let menuOptions = `
                    <li><a class="dropdown-item fw-bolder item-view" href="#" data-startup='${JSON.stringify(startup)}'>Visualizar</a></li>
                    <li><a class="dropdown-item fw-bolder item-alter" href="#">Alterar</a></li>
                    <li><a class="dropdown-item fw-bolder item-users" href="startup-users.html?id=${startup.id}">Usuarios</a></li>
                    <hr>
                    <li><a class="dropdown-item fw-bolder text-danger item-delete" href="#" data-startup='${JSON.stringify(startup)}'>Excluir</a></li>
                `;

                const $col = $(`
                    
                    <div class="card startup-card">
                        <div class="startup-card-header position-relative">
                            <i class="text-${startup.incubadora?.color || 'primary'} ${startup.incubadora?.icon || 'bi bi-briefcase'}"></i>
                            <h4>${ativoBadge}${startup.nome || 'Sem nome'}</h4>
                            <input type="hidden" class="startup-id-input" value="${startup.id}">
                            <div class="dropdown ms-2">
                                <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="icon text-dark bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    ${menuOptions}
                                </ul>
                            </div>
                            <span class="tag bg-opacity-25 bg-${startup.incubadora?.color || 'danger'} text-${startup.incubadora?.color || 'danger'}">
                                ${startup.incubadora?.tag || 'N/A'}
                            </span>
                        </div>

                        <!-- Corpo do Card -->
                        <div class="startup-card-body">
                            <p><strong>CNPJ:</strong> ${startup.cnpj || 'Não informado'}</p>
                            <p><strong>Área de Atuação:</strong> ${startup.areaAtuacao || 'Não informada'}</p>
                            <p><strong>Responsável:</strong> ${startup.responsavel?.nome || 'Não informado'}</p>
                            <p><strong>Incubadora:</strong> ${startup.incubadora?.nome || 'Não informado'}</p>
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
            $container.html('<div class="alert alert-danger">Erro ao carregar startups.</div>');
        });

    $('#search-startup-input').on('input', function () {
        const search = $(this).val().toLowerCase();
        $('#startups-container .card').each(function () {
            const nome = $(this).find('h5').text().toLowerCase();
            const cnpj = $(this).find('.card-body div .cnpj').text().toLowerCase();
            const responsavel = $(this).find('.card-body div .startup-responsavel').text().toLowerCase();
            if (nome.includes(search) || cnpj.includes(search) || responsavel.includes(search)) {
                $(this).closest('.col-md-6, .col-lg-4').show();
            } else {
                $(this).closest('.col-md-6, .col-lg-4').hide();
            }
        });
    });

    $(document).on('click', '.item-view', function (e) {
        e.preventDefault();
        const startup = $(this).data('startup');
        showStartupDetails(startup);
    });

    
    function showStartupDetails(startup) {
        document.getElementById('startup-nome').textContent = startup.nome;
        document.getElementById('startup-cnpj').textContent = startup.cnpj;
        document.getElementById('startup-area').textContent = startup.areaAtuacao;
        document.getElementById('startup-ativo').textContent = startup.ativo ? 'Sim' : 'Não';
        document.getElementById('startup-responsavel').textContent = startup.responsavel.nome;
        document.getElementById('startup-email').textContent = startup.responsavel.email;

        var modal = new bootstrap.Modal(document.getElementById('startupDetailModal'));
        modal.show();
    }

    $(document).on('click', '.item-delete', function (e) {
        e.preventDefault();
        const $card = $(this).closest('.card');
        const startupData = $card.find('.item-view').data('startup');
        if (!startupData || !startupData.id) {
            appendAlert('ID da startup não encontrado.', 'danger'); 
            return;
        }
        if (confirm(`Tem certeza que deseja excluir a startup "${startupData.nome}"?`)) {
            $.ajax({
                url: `http://localhost:6060/api/startups/${startupData.id}`,
                type: 'DELETE',
                success: function (data) {
                    $card.closest('.col-md-6, .col-lg-4').remove();
                    appendAlert('Startup excluída com sucesso.', 'success'); 
                },
                error: function (data) {
                    appendAlert(data.responseJSON.erro, 'danger'); 
                }
            });
        }
    });

    function carregarUsuariosNoSelect() {
        $.get('http://localhost:6060/api/usuarios')
            .done(function (usuarios) {
                const $select = $('#add-edit-startup-form select[name="responsavel"]');
                $select.empty();
                $select.append('<option value="">Selecione um responsável</option>');
                usuarios.forEach(function (usuario) {
                    $select.append(`<option value="${usuario.id}">${usuario.nome} (${usuario.email})</option>`);
                });
            })
            .fail(function () {
                appendAlert('Erro ao carregar usuários.', 'danger');
            });
    }

    $(document).on('click', '.item-alter', function (e) {
        e.preventDefault();
        const startup = $(this).closest('.card').find('.item-view').data('startup');
        if (!startup) {
            appendAlert('Dados da startup não encontrados.', 'danger');
            return;
        }

        changeTitleModalEdit(`${startup.id} - ${startup.nome}`)

        // Preenche o formulário do modal com os dados da startup
        const $form = $('#add-edit-startup-form');
        $form.find('input[name="nome"]').val(startup.nome || '');
        $form.find('input[name="cnpj"]').val(startup.cnpj || '');
        $form.find('input[name="areaAtuacao"]').val(startup.areaAtuacao || '');
        $form.find('input[name="ativo"]').prop('checked', startup.ativo);
        $form.find('select[name="responsavel"]').val(startup.responsavel?.id || '');

        // Salva o ID da startup no formulário (pode ser em um campo hidden ou data attribute)
        $form.data('startup-id-input', startup.id);

        // Abre o modal
        var modal = new bootstrap.Modal(document.getElementById('addEditStartupModal'));
        modal.show();
    });

    $(document).on('click', '#add-startup-btn', function(e){

        e.preventDefault();

        const $form = $('#add-edit-startup-form')

        changeTitleModalEdit('Nova Startup')

        limparCamposFormulario($form);
        var modal = new bootstrap.Modal(document.getElementById('addEditStartupModal'));
        modal.show();

    })

    $('#add-edit-startup-form').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        // Tente pegar o ID do campo hidden OU do data attribute
        let startupId = $form.find('input[name="startup-id-input"]').val();
        if (!startupId) {
            startupId = $form.data('startup-id-input');
        }

        const nome = $form.find('input[name="nome"]').val();
        const cnpj = $form.find('input[name="cnpj"]').val();
        const areaAtuacao = $form.find('input[name="areaAtuacao"]').val();
        const responsavelId = $form.find('select[name="responsavel"]').val();
        const status = $form.find('input[name="ativo"]').is(':checked');

        if (!nome || !cnpj || !areaAtuacao || !responsavelId) {
            appendAlert('Preencha todos os campos obrigatórios.', 'danger');
            return;
        }

        const startupData = {
            nome,
            cnpj,
            areaAtuacao,
            responsavel: {
                id: responsavelId
            },
            ativo: status
        };

        // Se tem ID, é alteração (PUT); se não, é inclusão (POST)
        const isEdit = !!startupId;
        const url = isEdit
            ? `http://localhost:6060/api/startups/${startupId}`
            : 'http://localhost:6060/api/startups';
        const type = isEdit ? 'PUT' : 'POST';

        $.ajax({
            url,
            type,
            contentType: 'application/json',
            data: JSON.stringify(startupData),
            success: function () {
                appendAlert(
                    isEdit ? 'Startup atualizada com sucesso!' : 'Startup cadastrada com sucesso!',
                    'success'
                );
                $('#addEditStartupModal').modal('hide');
                $form[0].reset();
                $form.removeData('startup-id-input');
                $form.find('input[name="startup-id-input"]').val('');
                location.reload();
            },
            error: function (xhr) {
                let msg = isEdit ? 'Erro ao atualizar startup.' : 'Erro ao cadastrar startup.';
                if (xhr.responseJSON && xhr.responseJSON.erro) {
                    msg = xhr.responseJSON.erro;
                }
                appendAlert(msg, 'danger');
            }
        });
    });

    
    function limparCamposFormulario($form) {
        $form.find('input[type="text"], input[type="hidden"], input[type="email"], input[type="number"], textarea').val('');
        $form.find('input[name="ativo"]').prop('checked', true);
        $form.find('select').val('');
    }

    function changeTitleModalEdit(Title){

        const modalTitle = $('#addEditStartupModalLabel');

        modalTitle.html(Title)

    }


    const listElements = [
        '#add-startup-btn',
        '.item-alter',
        '.item-delete'
    ]

    function esconderSeNaoAdmin(selector) {
        const usuario = JSON.parse(localStorage.getItem('user') || '{}');
        if (!usuario || usuario.tipo !== 'ADMIN') {
            // Usa event delegation para esconder elementos dinâmicos
            const observer = new MutationObserver(function(mutationsList) {
                mutationsList.forEach(function(mutation) {
                    $(selector).each(function() {
                        $(this).hide();
                    });
                });
            });
            // Observa mudanças no container principal
            const container = document.getElementById('startups-container');
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
            // Esconde elementos já existentes
            $(selector).each(function() {
                $(this).hide();
            });
        }
    }

    listElements.forEach(function(selector) {
        esconderSeNaoAdmin(selector);
    });

    carregarUsuariosNoSelect();

});
