(function() {

    const currentPage = window.location.pathname.split('/').pop();

    const sidebarItems = [
        {
            icon: "bi bi-graph-up",
            icon_active: "bi bi-graph-up-arrow",
            label: "Dashboard",
            link: "dashboard.html",
            isActive: currentPage === "dashboard.html",
            disabled: false
        },
        {
            icon: "bi bi-buildings",
            icon_active: "bi bi-buildings-fill",
            label: "Incubadoras",
            link: "incubadoras.html",
            isActive: currentPage === "incubadoras.html",
            disabled: false
        },
        {
            icon: "bi-lightbulb",
            icon_active: "bi-lightbulb-fill",
            label: "Startups",
            link: "startups.html",
            isActive: currentPage === "startups.html",
            disabled: false
        },
        {
            icon: "bi-people",
            icon_active: "bi-people-fill",
            label: "Equipe",
            link: "equipe.html",
            isActive: currentPage === "equipe.html",
            disabled: false
        },
        {
            icon: "bi-kanban",
            icon_active: "bi-kanban-fill",
            label: "Projetos",
            link: "projetos.html",
            isActive: currentPage === "projetos.html",
            disabled: false
        },
    ];

    let sidebarHTML = `
        <nav class="sidebar d-flex flex-column p-3">
            <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <img src="https://img.icons8.com/?size=100&id=2SZRxFHxL9R3&format=png&color=000000" alt="Logo" width="32" height="32" class="me-2">
                <span class="fs-4">StartControl</span>
            </a>
            <hr>
            <ul class="nav nav-pills flex-column mb-auto">`

    sidebarItems.forEach(item => {
        sidebarHTML += `
            <li class="nav-item">
                <a href="${item.link}" class="nav-link ${item.isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}" aria-current="page">
                    <i class="bi ${item.isActive ? item.icon_active : item.icon}"></i>
                    ${item.label}
                </a>
            </li>`;
    });

    // Recupera o usuário do localStorage
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        user = null;
    }
    const userName = user && user.nome ? user.nome : 'Usuário';

    sidebarHTML += `</ul>
            <hr>
            <div class="dropup">
                <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(userName)}" alt="" width="32" height="32" class="rounded-circle me-2">
                    <strong>${abreviarSobrenome(userName)}</strong>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser">
                    <li><a class="dropdown-item" id="exit-btn">Sair</a></li>
                </ul>
            </div>
        </nav>
    `;

    function logout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    $(function() {
        $('#exit-btn').on('click', function(e) {
            e.preventDefault();
            logout();
        });
    });

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    function abreviarSobrenome(nomeCompleto) {
        if (!nomeCompleto) return '';
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length < 3) return nomeCompleto;
        // Considera o primeiro nome, o último sobrenome e abrevia o(s) do meio
        const primeiroNome = partes[0];
        const ultimoSobrenome = partes[partes.length - 1];
        const doMeio = partes.slice(1, -1).map(p => {
            // Não abrevia preposições comuns
            if (['de', 'da', 'do', 'das', 'dos'].includes(p.toLowerCase())) return p;
            return p[0].toUpperCase() + '.';
        });
        return [primeiroNome, ...doMeio, ultimoSobrenome].join(' ');
    }

    document.getElementById('sidebar-component').innerHTML = sidebarHTML;
})();