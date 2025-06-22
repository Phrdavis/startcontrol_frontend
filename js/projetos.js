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
                    var linha = `
                        <tr>
                            <td>${projeto.id}</td>
                            <td>${projeto.nome}</td>
                            <td>${limitarTexto(projeto.descricao)}</td>
                            <td>${projeto.responsavel ? projeto.responsavel.nome : ''}</td>
                            <td>${projeto.status}</td>
                            <td>
                                <!-- Coloque aqui os botões de ação se necessário -->
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

    function limitarTexto(texto) {
        if (typeof texto !== 'string') return '';
        return texto.length > 20 ? texto.slice(0, 20) + '...' : texto;
    }

    carregarProjetos();
});