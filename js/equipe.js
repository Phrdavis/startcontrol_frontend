$(document).ready(function() {

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
        $('#table-users tbody tr').filter(function() {
            $(this).toggle(
                $(this).text().toLowerCase().indexOf(value) > -1
            );
        });
    });

    function carregarUsuarios() {
        $.ajax({
            url: 'http://localhost:6060/api/usuarios',
            method: 'GET',
            dataType: 'json',
            success: function(usuarios) {
                var $tbody = $('#table-users tbody');
                $tbody.empty();
                usuarios.forEach(function(usuario) {

                    let status_user = usuario.ativo ? 'status-user-ativo' : 'status-user-inativo';

                    var row = `
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
                                        <li><a class="dropdown-item text-danger btn-delete-user" href="#" data-usuario='${JSON.stringify(usuario)}'>Excluir</a></li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    `;
                    $tbody.append(row);
                });
            },
            error: function() {
                alert('Erro ao carregar usuários.');
            }
        });
    }

    // Abrir modal em modo de inclusão
    $('#add-usuario-btn').on('click', function() {
        $('#usuarioModalLabel').text('Adicionar Usuário');
        $('#usuarioForm')[0].reset();
        $('#usuario_id').val('');
        $('#usuario_status').prop('checked', true);
        $('.modal_id').hide();
        $('.modal_status').hide();
        $('#usuarioModal').modal('show');
    });

    // Submeter formulário para adicionar usuário
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

    // Abrir modal em modo de detalhes/edição
    $('#table-users').on('click', '.btn-detalhes-user', function(e) {
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

    $('#table-users').on('click', '.btn-delete-user', async function(e) {
        const userId = $(this).data('usuario').id;
        if (confirm('Tem certeza que deseja deletar este usuário?')) {
            try {
                const response = await fetch(`http://localhost:6060/api/usuarios/${userId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    appendAlert('Usuário deletado com sucesso!', 'success');
                    // Opcional: remover o usuário da interface
                    $(this).closest('tr').remove();
                } else {
                    const data = await response.json();
                    appendAlert(data.erro || 'Falha ao deletar usuário.', 'danger');
                }
            } catch (error) {
                appendAlert('Erro ao conectar ao servidor.', 'danger');
            }
        }
    });

    carregarUsuarios();
});