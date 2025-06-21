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
                const token = data.token;
                if (token) {
                    // Decodifica o payload do JWT
                    const payloadBase64 = token.split('.')[1];
                    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
                    const payload = JSON.parse(payloadJson);

                    // Salva os dados no localStorage
                    const user = {
                        id: payload.id,
                        nome: payload.nome,
                        email: payload.email,
                        tipo: payload.tipo,
                        token: token
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                }
                window.location.href = 'startups.html';
            } else {
                appendAlert(data.erro || 'Falha na autenticação.', 'danger');
            }
            
        } catch (error) {
            appendAlert('Erro ao conectar ao servidor.', 'danger');
        }
    });

    $('.link-forget-password').on('click', function (e) {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('recuperarSenhaModal'));
        modal.show();
    });

    async function sendPasswordRecovery(email, senha) {
        try {
            const response = await fetch('http://localhost:6060/api/usuarios/trash-password-recovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: { erro: 'Erro ao conectar ao servidor.' } };
        }
    }

    $('#recuperarSenhaForm').on('submit', async function (e) {
        e.preventDefault();
        const email = $('#recuperarEmail').val();
        const senha = $('#novaSenha').val();

        console.log(email, senha)

        const result = await sendPasswordRecovery(email, senha);

        if (result.ok) {
            appendAlert(result.data.mensagem, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('recuperarSenhaModal'));
            if (modal) modal.hide();
        } else {
            appendAlert(result.data.erro || 'Erro ao enviar solicitação de recuperação.', 'danger');
        }
    });

    $('.login-cadastro').on('click', function (e) {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('cadastroUsuarioModal'));
        modal.show();
    });
    $('#cadastroUsuarioForm').on('submit', async function (e) {
        e.preventDefault();
        const nome = $('#cadastroNome').val();
        const email = $('#cadastroEmail').val();
        const senha = $('#cadastroSenha').val();
        const tipo = $('#cadastroTipo').val();

        try {
            const response = await fetch('http://localhost:6060/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha, nome, tipo })
            });

            const data = await response.json();

            console.log(data);

            if (response.ok) {
                appendAlert("Usuário cadastrado com sucesso!", 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('cadastroUsuarioModal'));
                if (modal) modal.hide();
            } else {
                appendAlert(data.erro || 'Erro ao cadastrar usuário.', 'danger');
            }
        } catch (error) {
            appendAlert('Erro ao conectar ao servidor.', 'danger');
        }
    });

});
