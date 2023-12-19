import { GithubUser } from './GithubUser.js';

// async await vs then
// pelo que entendi o then é para quando há uma função que pode demorar mais do que o normal (async  e promise)
// e é preciso por o then para só executar o resto do que você quer depois que isso temrinar (para não gerar erros)

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
class Favorites {
	constructor(root) {
		this.root = document.querySelector(root);
		this.load();
	}

	load() {
		this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
	}

	save() {
		localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
	}

	async add(username) {
		try {
			const userExists = this.entries.find((entry) => entry.login === username);

			if (userExists) {
				throw new Error('Usuário já cadastrado');
			}

			const user = await GithubUser.search(username);

			if (user.login === undefined) {
				throw new Error('Usuário não encontrado');
			}

			this.entries = [user, ...this.entries];
			this.update();
			this.save();
		} catch (error) {
			alert(error.message);
		}
	}

	delete(user) {
		// Higher-order functions (map, filter, find, reduce)
		// Princípo da imutabilidade (remover e criar novamente ao invés de alterar o antigo)
		const filteredEntries = this.entries.filter(
			(entry) => entry.login !== user.login
		);

		this.entries = filteredEntries;
		this.update();
		this.save();
	}
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
	constructor(root) {
		super(root);

		this.tbody = this.root.querySelector('table tbody');

		this.update();
		this.onadd();
	}

	onadd() {
		const addButon = this.root.querySelector('.search button');

		addButon.onclick = () => {
			const { value } = this.root.querySelector('.search input');

			this.add(value);
		};
	}

	update() {
		this.removeAllTr();

		this.entries.forEach((user) => {
			const row = this.createRow();

			row.querySelector(
				'.user img'
			).src = `https://github.com/${user.login}.png`;
			row.querySelector('.user img').alt = `Imagem de ${user.name}`;

			row.querySelector('.user a').href = `https://github.com/${user.login}`;

			row.querySelector('.user p').textContent = user.name;
			row.querySelector('.user span').textContent = user.login;

			row.querySelector('.repositories').textContent = user.public_repos;
			row.querySelector('.followers').textContent = user.followers;

			row.querySelector('.remove').onclick = () => {
				const isOk = confirm('Tem certeza que deseja deletar essa linha?');

				if (isOk) {
					this.delete(user);
				}
			};

			this.tbody.append(row);
		});
	}

	createRow() {
		const tr = document.createElement('tr');

		// o tr precisa ser criado pela DOM
		tr.innerHTML = `
			<td class="user">
				<img
				src="https://github.com/maykbrito.png"
				alt="Imagem de maykbrito"
				/>
				<a href="https://github.com/maykbrito" target="_blank">
					<p>Mayk Brito</p>
					<span>maykbrito</span>
				</a>
			</td>
			<td class="repositories">76</td>
			<td class="followers">9589</td>
			<td><button class="remove">&times;</button></td>
			`;

		return tr;
	}

	removeAllTr() {
		this.tbody.querySelectorAll('tr').forEach((tr) => {
			tr.remove();
		});
	}
}
