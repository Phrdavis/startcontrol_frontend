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

    $('#search-projeto-input').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('#table-projetos tbody tr').filter(function() {
            $(this).toggle(
                $(this).text().toLowerCase().indexOf(value) > -1
            );
        });
    });

    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    const usuarioId = usuario && usuario.id ? usuario.id : null;
    
    function carregarProjetos() {
        $.ajax({
            url: 'http://localhost:6060/api/projetos',
            method: 'GET',
            dataType: 'json',
            success: function(projetos) {
                var $tbody = $('#table-projetos tbody');
                $tbody.empty();
                $.each(projetos, function(index, projeto) {
                    const statusObj = statusList.find(s => s.label === projeto.status);
                    const statusBadge = statusObj
                        ? `<span class="badge bg-${statusObj.badgeClass}">${statusObj.label}</span>`
                        : `<span class="badge bg-secondary">${projeto.status}</span>`;

                    var responsavelNome = projeto.responsavel ? projeto.responsavel.nome : '';
                    if (projeto.responsavel && isUsuarioLogado(projeto.responsavel.id)) {
                        responsavelNome = `<strong>${responsavelNome}</strong>`;
                    }
                    var linha = `
                        <tr>
                            <td>${projeto.id}</td>
                            <td>${projeto.nome}</td>
                            <td>${limitarTexto(projeto.descricao)}</td>
                            <td>${responsavelNome}</td>
                            <td>${projeto.startup?.nome || ''}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <div class="dropdown">
                                    <button class="btn btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bi bi-three-dots"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
                                        <li><a class="dropdown-item btn-detalhes-projeto" href="#">Detalhes</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item text-danger btn-delete-projeto" href="#" data-projeto='${JSON.stringify(projeto)}'>Excluir</a></li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    `;
                    $tbody.append(linha);
                });
            },
            error: function() {
                $('#alert').html('<div class="alert alert-danger">Erro ao carregar projetos.</div>');
            }
        });
    }

    const statusList = [
        { label: 'Em andamento', badgeClass: 'warning' },
        { label: 'Concluído', badgeClass: 'success' },
        { label: 'Pendente', badgeClass: 'secondary' },
        { label: 'Cancelado', badgeClass: 'danger' },
        { label: 'Em análise', badgeClass: 'info' },
        { label: 'Aguardando aprovação', badgeClass: 'primary' }
    ];

    function limitarTexto(texto) {
        if (typeof texto !== 'string') return '';
        return texto.length > 20 ? texto.slice(0, 20) + '...' : texto;
    }

    function isUsuarioLogado(id) {
        return usuarioId !== null && usuarioId === id;
    }

    // Abrir modal em modo de inclusão
    $('#add-projeto-btn').on('click', function() {
        $('#projetoModalLabel').text('Adicionar Projeto');
        $('#projetoForm')[0].reset();
        $('#projeto_id').val('');
        $('.modal_id').hide();
        $('#projetoModal').modal('show');
        carregarResponsaveis();
        carregarStartups();
        carregarStatusProjeto()
    });

    // Submeter formulário para adicionar/editar projeto
    $('#projetoForm').on('submit', function(e) {
        e.preventDefault();
        var projeto_id = $('#projeto_id').val();
        var projetoData = {
            nome: $('#projeto_nome').val(),
            descricao: $('#projeto_descricao').val(),
            responsavel: {id: $('#projeto_responsavel').val()},
            startup: {id: $('#projeto_startup').val()},
            status: $('#projeto_status').val()
        };

        console.log(projetoData)
        const isEdicao = !!projeto_id;
        const url = isEdicao
            ? `http://localhost:6060/api/projetos/${projeto_id}`
            : 'http://localhost:6060/api/projetos';
        const method = isEdicao ? 'PUT' : 'POST';

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(projetoData),
            success: function() {
                $('#projetoModal').modal('hide');
                carregarProjetos();
                appendAlert(`Projeto ${isEdicao ? 'alterado' : 'criado'} com sucesso.`, 'success');
            },
            error: function(xhr) {
                let msg = 'Erro ao salvar projeto.';
                if (xhr.responseJSON && xhr.responseJSON.erro) msg = xhr.responseJSON.erro;
                appendAlert(msg, 'danger');
            }
        });
    });

    // Abrir modal em modo de detalhes/edição
    $('#table-projetos').on('click', '.btn-detalhes-projeto', function(e) {
        e.preventDefault();
        var $row = $(this).closest('tr');
        var projeto_id = $row.find('td').eq(0).text();

        $.ajax({
            url: 'http://localhost:6060/api/projetos/' + projeto_id,
            method: 'GET',
            dataType: 'json',
            success: function(projeto) {
                $('#projetoModalLabel').text('Detalhes do Projeto');
                $('#projeto_id').val(projeto.id).prop('readonly', true);
                $('.modal_id').show();
                $('#projeto_nome').val(projeto.nome);
                $('#projeto_descricao').val(projeto.descricao);
                carregarResponsaveis(projeto.responsavel?.id);
                carregarStartups(projeto.startup?.id);
                carregarStatusProjeto(projeto.status)
                $('#projetoModal').modal('show');
            },
            error: function() {
                appendAlert('Erro ao carregar detalhes do projeto.', 'danger');
            }
        });
    });

    // Carregar responsáveis no select
    function carregarResponsaveis(selectedId) {
        $.ajax({
            url: 'http://localhost:6060/api/usuarios',
            method: 'GET',
            dataType: 'json',
            success: function(usuarios) {
                var $select = $('#projeto_responsavel');
                $select.empty();
                $select.append('<option value="">Selecione...</option>');
                $.each(usuarios, function(_, usuario) {
                    $select.append(
                        `<option value="${usuario.id}" ${selectedId == usuario.id ? 'selected' : ''}>${usuario.nome}</option>`
                    );
                });
            },
            error: function() {
                appendAlert('Erro ao carregar responsáveis.', 'danger');
            }
        });
    }

    // Carregar startups no select
    function carregarStartups(selectedId) {
        $.ajax({
            url: 'http://localhost:6060/api/startups',
            method: 'GET',
            dataType: 'json',
            success: function(startups) {
                var $select = $('#projeto_startup');
                $select.empty();
                $select.append('<option value="">Selecione...</option>');
                $.each(startups, function(_, startup) {
                    $select.append(
                        `<option value="${startup.id}" ${selectedId == startup.id ? 'selected' : ''}>${startup.nome}</option>`
                    );
                });
            },
            error: function() {
                appendAlert('Erro ao carregar startups.', 'danger');
            }
        });
    }

    function carregarStatusProjeto(selectedStatus) {
        var $select = $('#projeto_status');
        $select.empty();
        $select.append('<option value="">Selecione...</option>');
        statusList.forEach(function(status) {
            $select.append(
                `<option value="${status.label}" ${selectedStatus == status.label ? 'selected' : ''}>${status.label}</option>`
            );
        });
    }

    carregarProjetos();
});