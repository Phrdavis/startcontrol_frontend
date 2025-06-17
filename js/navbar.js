(function() {

    const sidebarItems = [
        {
            icon: "bi-lightbulb",
            label: "Startups",
            link: "#",
            isActive: true,
            disabled: true
        },
        {
            icon: "bi-bar-chart",
            label: "Relatórios",
            link: "#",
            isActive: false,
            disabled: true
        },
        {
            icon: "bi-people",
            label: "Equipe",
            link: "#",
            isActive: false,
            disabled: true
        },
        {
            icon: "bi-gear",
            label: "Configurações",
            link: "#",
            isActive: false,
            disabled: true
        },
        {
            icon: "bi-question-circle",
            label: "Ajuda",
            link: "#",
            isActive: false,
            disabled: true
        }
    ];

    let sidebarHTML = `
        <nav class="sidebar d-flex flex-column p-3">
            <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span class="fs-4">StartControl</span>
            </a>
            <hr>
            <ul class="nav nav-pills flex-column mb-auto">`

    sidebarItems.forEach(item => {
        sidebarHTML += `
            <li class="nav-item">
                <a href="${item.link}" class="nav-link ${item.isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}" aria-current="${item.isActive ? 'page' : ''}">
                    <i class="bi ${item.icon}"></i>
                    ${item.label}
                </a>
            </li>`;
    });

    sidebarHTML += `</ul>
            <hr>
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://ui-avatars.com/api/?name=User" alt="" width="32" height="32" class="rounded-circle me-2">
                    <strong>Usuário</strong>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser">
                    <li><a class="dropdown-item" href="#">Perfil</a></li>
                    <li><a class="dropdown-item" href="index.html">Sair</a></li>
                </ul>
            </div>
        </nav>
    `;
    document.getElementById('sidebar-component').innerHTML = sidebarHTML;
})();