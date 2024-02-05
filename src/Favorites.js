import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(user => user.login === username)

            if(userExists) {
                throw new Error('Usuário já está na lista.')
            }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries
            .filter((entry) => entry.login !== user.login)

        this.entries = filteredEntries
        
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')

        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            // console.dir(this.root.querySelector('.search input'))

            this.add(value)
            this.root.querySelector('.search input').value = ""
        }
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <tr>
                <td class="user flex">
                    <img src="../assets/estrela.svg" alt="">

                    <a href="#" target="_blank">
                        <p>Default User</p>
                        <span>/defaultuser</span>
                    </a>
                </td>

                <td class="repositories">123</td>

                <td class="followers">1234</td>

                <td class="remove-user">
                    <button>Remover</button>
                </td>
            </tr>
        `

        return tr
    }

    update() {
        const section = document.querySelector("section")

        this.removeAllTr()

        if(!this.entries.length) {
            section.classList.add('table-empty')
            return
        }

        section.classList.remove('table-empty')

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = '/' + user.login
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            
            row.querySelector('.remove-user').onclick = () => {
                const isOk = confirm("Tem certeza que deseja deletar este usuário da lista?")

                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })

    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach(tr => tr.remove())
    }
}