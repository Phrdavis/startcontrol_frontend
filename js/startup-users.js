$(document).ready( async function() {

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

    $('#search-usuario-input').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('#table-startup-users tbody tr').filter(function() {
            $(this).toggle(
                $(this).text().toLowerCase().indexOf(value) > -1
            );
        });
    });

    // Função para pegar o ID da URL
    function getIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }


    const id = getIdFromUrl();

    const startup = await getStartupById(id).then(data =>{ 
    
        $('.name-startup').text(`${data.nome} - Usuários`);
        return data
    
    })
    
    async function getStartupById(startupId) {
        try {
            const response = await $.ajax({
                url: `http://localhost:6060/api/startups/${startupId}`,
                method: 'GET',
                dataType: 'json'
            });
            return response;
        } catch (error) {
            console.error('Erro ao buscar startup:', error);
            return null;
        }
    }

    
    // Abrir modal em modo de detalhes/edição
    $('#table-startup-users').on('click', '.btn-detalhes-user', function(e) {
        e.preventDefault();
        var $row = $(this).closest('tr');
        var usuario_id = $row.find('td').eq(1).text();

        $.ajax({
            url: 'http://localhost:6060/api/usuarios/' + usuario_id,
            method: 'GET',
            dataType: 'json',
            success: function(usuario) {
                console.log(usuario)
                $('#usuarioModalLabel').text('Detalhes do Usuário');
                $('#usuario_id').val(usuario.id).prop('disabled', true);
                $('.modal_id').show();
                $('.modal_status').show();
                $('#usuario_status').prop('checked', usuario.ativo);
                $('#usuario_nome').val(usuario.nome);
                $('#usuario_email').val(usuario.email);
                $('#usuario_senha').val(''); // Por segurança, não preenche senha
                $('#usuario_tipo').val(usuario.tipo);
                $('#usuarioModal').modal('show');
            },
            error: function() {
                alert('Erro ao carregar detalhes do usuário.');
            }
        });
    });

    
    $('#usuarioForm').on('submit', function(e) {
        e.preventDefault();
        var usuario_id = $('#usuario_id').val();
        var usuarioData = {
            nome: $('#usuario_nome').val(),
            email: $('#usuario_email').val(),
            senha: '12345',
            ativo: $('#usuario_status').is(':checked'),
            tipo: $('#usuario_tipo').val()
        };

        const isEdicao = !!usuario_id;
        const url = isEdicao 
            ? `http://localhost:6060/api/usuarios/${usuario_id}` 
            : 'http://localhost:6060/api/usuarios';
        const method = isEdicao ? 'PUT' : 'POST';


        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(usuarioData),
            success: function() {
                $('#usuarioModal').modal('hide');
                carregarUsuarios();
                appendAlert(`Usuário ${isEdicao ? 'alterado' : 'criado'} com sucesso.`, 'success'); 
            },
            error: function(data) {
                appendAlert(data.erro, 'danger'); 
            }
        });
    });

    
    function carregarUsuarios() {
        $.ajax({
            url: `http://localhost:6060/api/startups/usuarios/${id}`,
            method: 'GET',
            success: function(data) {
                console.log(data);

                const tbody = $('#table-startup-users tbody');
                tbody.empty();

                data.forEach(item => {
                    // item[0] = associacaoId, item[1] = usuario
                    const associacaoId = item[0];
                    const usuario = item[1];
                    const status_user = usuario.ativo ? 'ativo' : 'inativo';
                    const row = `
                        <tr>
                            <td><span class="status-user ${status_user}"></span></td>
                            <td>${usuario.id || ''}</td>
                            <td>${usuario.nome || ''}</td>
                            <td>${usuario.email || ''}</td>
                            <td>${usuario.tipo || ''}</td>
                            <td>
                                <div class="dropdown">
                                    <button class="btn btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bi bi-three-dots"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
                                        <li><a class="dropdown-item btn-detalhes-user" href="#">Detalhes</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <a class="dropdown-item text-danger btn-remove-user" href="#" 
                                                data-associacao='${JSON.stringify({id: associacaoId})}'
                                                data-usuario='${JSON.stringify(usuario)}'>
                                                Remover
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error('Erro ao buscar usuário:', error);
            }
        });
    }
    
    async function carregarTodosUsuarios() {
        try {
            const response = await $.ajax({
                url: 'http://localhost:6060/api/usuarios',
                method: 'GET',
                dataType: 'json'
            });
            console.log('Todos os usuários:', response);
            popularSelectUsuarios(response)

            return response;
        } catch (error) {
            console.error('Erro ao carregar todos os usuários:', error);
            return [];
        }
    }

    function popularSelectUsuarios(usuarios) {
        const $select = $('#selectUsuarioVinculo');
        $select.empty();
        $select.append('<option value="">Selecione um usuário</option>');
        usuarios.forEach(usuario => {
            const optionText = `${usuario.nome} (${usuario.email})`;
            $select.append(`<option value="${usuario.id}">${optionText}</option>`);
        });
    }

    $('#add-startup-user-btn').on('click', function() {
        $('#vincularUsuarioModal').modal('show');
    });

    $('#vincularUsuarioForm').on('submit', function(e) {
        e.preventDefault();
        const usuarioId = $('#selectUsuarioVinculo').val();
        if (!usuarioId || !id) {
            appendAlert('Selecione um usuário válido.', 'danger');
            return;
        }
        const payload = {
            usuarioId: { id: Number(usuarioId) },
            startupId: { id: Number(id) }
        };

        $.ajax({
            url: 'http://localhost:6060/api/associacoes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                $('#vincularUsuarioModal').modal('hide');
                carregarUsuarios();
                appendAlert('Usuário vinculado com sucesso.', 'success');
            },
            error: function(xhr) {
                appendAlert('Erro ao vincular usuário.', 'danger');
            }
        });
    });

    $('#table-startup-users').on('click', '.btn-remove-user', function(e) {
        e.preventDefault();
        const associacao = $(this).data('associacao');
        if (!associacao || !associacao.id) {
            appendAlert('Não foi possível identificar a associação do usuário.', 'danger');
            return;
        }
        if (!confirm('Tem certeza que deseja remover este usuário da startup?')) {
            return;
        }
        $.ajax({
            url: `http://localhost:6060/api/associacoes/${associacao.id}`,
            method: 'DELETE',
            success: function() {
                carregarUsuarios();
                appendAlert('Usuário removido com sucesso.', 'success');
            },
            error: function() {
                appendAlert('Erro ao remover usuário.', 'danger');
            }
        });
    });
    


    const listElements = [
        '#add-startup-user-btn',
        '.btn-remove-user',
        '.modal-footer'
    ]

    function esconderSeNaoAdmin(selector) {
        const usuario = JSON.parse(localStorage.getItem('user') || '{}');
        console.log(usuario, startup)
        if (usuario && (usuario.tipo !== 'ADMIN' && startup.responsavel.id != usuario.id)) {
            // Usa event delegation para esconder elementos dinâmicos
            const observer = new MutationObserver(function(mutationsList) {
                mutationsList.forEach(function(mutation) {
                    $(selector).each(function() {
                        $(this).hide();
                    });
                });
            });
            // Observa mudanças no container principal
            const container = document.getElementById('equipe-container');
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

    carregarTodosUsuarios()
    carregarUsuarios()

});