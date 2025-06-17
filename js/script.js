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

    $('#login-form').on('submit', async function (e) {
        e.preventDefault();

        const email = $('#email').val();
        const senha = $('#senha').val();

        try {
            const response = await fetch('http://localhost:6060/api/usuarios/autenticar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                appendAlert('Login realizado com sucesso!', 'success'); 
                window.location.href = 'startups.html';
            } else {
                appendAlert(data.erro || 'Falha na autenticação.', 'danger');
            }
            
        } catch (error) {
            appendAlert('Erro ao conectar ao servidor.', 'danger');
        }
    });
});
