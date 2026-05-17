<script lang="ts">
	import { goto } from '$app/navigation';
	import { root, token } from '$lib';
	import RoleSelect from '$lib/components/RoleSelect.svelte';

	interface LevelRole {
		level: number;
		roleId: string;
		multiplier: number;
	}

	interface Role {
		id: string;
		name: string;
		color: number;
	}

	let levelRoles: LevelRole[] = $state([]);
	let roles: Role[] = $state([]);
	let isSubmitting = $state(false);

	let newLevelRole = $state({
		level: 1,
		roleId: '',
		multiplier: 1
	});

	async function loadLevelRoles() {
		const res = await fetch(`${root}/api/levelroles`, {
			headers: { Authorization: $token! }
		});

		if (res.status === 401) {
			localStorage.removeItem('token');
			await goto('/login');
			return;
		}

		levelRoles = await res.json();
		// Sort by level ascending
		levelRoles.sort((a, b) => a.level - b.level);
	}

	async function loadRoles() {
		const res = await fetch(`${root}/api/roles`, {
			headers: { Authorization: $token! }
		});

		if (res.ok) {
			const allRoles = await res.json();
			roles = allRoles
				.filter((r: Role) => r.name !== '@everyone')
				.sort((a: Role, b: Role) => b.color - a.color);
		}
	}

	token.subscribe(async (t) => {
		if (t) {
			await Promise.all([loadLevelRoles(), loadRoles()]);
		}
	});

	function getRoleName(roleId: string): string {
		const role = roles.find(r => r.id === roleId);
		return role ? role.name : 'Unknown Role';
	}

	function getRoleColor(roleId: string): string {
		const role = roles.find(r => r.id === roleId);
		if (role && role.color) {
			return `#${role.color.toString(16).padStart(6, '0')}`;
		}
		return '#99aab5';
	}

	function getUsedRoleIds(): string[] {
		return levelRoles.map(lr => lr.roleId);
	}

	async function onSubmit(ev: SubmitEvent) {
		ev.preventDefault();

		if (!newLevelRole.roleId || newLevelRole.level < 1 || newLevelRole.multiplier < 1) {
			return;
		}

		isSubmitting = true;

		try {
			const res = await fetch(`${root}/api/levelroles`, {
				method: 'POST',
				headers: {
					Authorization: $token!,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newLevelRole)
			});

			if (res.ok) {
				newLevelRole = { level: 1, roleId: '', multiplier: 1 };
				await loadLevelRoles();
			} else {
				const error = await res.json();
				alert(error.message || 'Failed to create level role');
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function onDelete(level: number) {
		if (!confirm(`Are you sure you want to delete the level ${level} role?`)) {
			return;
		}

		const res = await fetch(`${root}/api/levelroles/${level}`, {
			method: 'DELETE',
			headers: { Authorization: $token! }
		});

		if (res.ok) {
			await loadLevelRoles();
		}
	}

	async function onUpdateMultiplier(level: number, newMultiplier: number) {
		if (newMultiplier < 1) return;

		const res = await fetch(`${root}/api/levelroles/${level}`, {
			method: 'PUT',
			headers: {
				Authorization: $token!,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ multiplier: newMultiplier })
		});

		if (res.ok) {
			await loadLevelRoles();
		}
	}
</script>

<div class="page-container">
	<!-- Create Section -->
	<div class="create-section">
		<div class="section-header">
			<i class="fa-solid fa-ranking-star"></i>
			<h1>Level Roles & Multipliers</h1>
		</div>
		<p class="section-description">Configure roles that are awarded at specific levels with XP/money multipliers</p>

		<form class="level-role-form" onsubmit={onSubmit}>
			<div class="form-row">
				<div class="form-group level-input">
					<label for="level">
						<i class="fa-solid fa-arrow-up-9-1"></i>
						Level
					</label>
					<input
						type="number"
						id="level"
						min="1"
						placeholder="1"
						bind:value={newLevelRole.level}
						required
					/>
				</div>

				<div class="form-group role-input">
					<label for="role">
						<i class="fa-solid fa-user-tag"></i>
						Role to Award
					</label>
					<RoleSelect bind:roleId={newLevelRole.roleId} excludeRoles={getUsedRoleIds()} />
				</div>

				<div class="form-group multiplier-input">
					<label for="multiplier">
						<i class="fa-solid fa-xmark"></i>
						Multiplier
					</label>
					<div class="multiplier-wrapper">
						<input
							type="number"
							id="multiplier"
							min="1"
							step="0.1"
							placeholder="1.0"
							bind:value={newLevelRole.multiplier}
							required
						/>
						<span class="multiplier-suffix">x</span>
					</div>
				</div>
			</div>

			<div class="form-info">
				<i class="fa-solid fa-circle-info"></i>
				<span>Multipliers stack! If a user has multiple level roles, their multipliers are added together.</span>
			</div>

			<button
				type="submit"
				class="submit-btn"
				disabled={!newLevelRole.roleId || newLevelRole.level < 1 || newLevelRole.multiplier < 1 || isSubmitting}
			>
				{#if isSubmitting}
					<i class="fa-solid fa-spinner fa-spin"></i>
					Adding...
				{:else}
					<i class="fa-solid fa-plus"></i>
					Add Level Role
				{/if}
			</button>
		</form>
	</div>

	<!-- Existing Level Roles -->
	<div class="list-section">
		<div class="section-header">
			<i class="fa-solid fa-list-ol"></i>
			<h2>Configured Level Roles</h2>
			{#if levelRoles.length > 0}
				<span class="count-badge">{levelRoles.length}</span>
			{/if}
		</div>

		{#if levelRoles.length > 0}
			<div class="level-roles-table">
				<div class="table-header">
					<span class="col-level">Level</span>
					<span class="col-role">Role</span>
					<span class="col-multiplier">Multiplier</span>
					<span class="col-actions">Actions</span>
				</div>

				{#each levelRoles as lr}
					<div class="table-row">
						<div class="col-level">
							<span class="level-badge">Lv. {lr.level}</span>
						</div>
						<div class="col-role">
							<span class="role-tag" style="--role-color: {getRoleColor(lr.roleId)}">
								<i class="fa-solid fa-at"></i>
								{getRoleName(lr.roleId)}
							</span>
						</div>
						<div class="col-multiplier">
							<div class="multiplier-edit">
								<button
									class="adjust-btn"
									onclick={() => onUpdateMultiplier(lr.level, Math.max(1, lr.multiplier - 0.1))}
									disabled={lr.multiplier <= 1}
								>
									<i class="fa-solid fa-minus"></i>
								</button>
								<span class="multiplier-value">{lr.multiplier.toFixed(1)}x</span>
								<button
									class="adjust-btn"
									onclick={() => onUpdateMultiplier(lr.level, lr.multiplier + 0.1)}
								>
									<i class="fa-solid fa-plus"></i>
								</button>
							</div>
						</div>
						<div class="col-actions">
							<button class="delete-btn" onclick={() => onDelete(lr.level)} title="Delete level role">
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="multiplier-preview">
				<h4>
					<i class="fa-solid fa-calculator"></i>
					Multiplier Preview
				</h4>
				<p>Example: A user with all these roles would have a <strong>{levelRoles.reduce((acc, lr) => acc + (lr.multiplier - 1), 1).toFixed(1)}x</strong> total multiplier</p>
			</div>
		{:else}
			<div class="empty-state">
				<i class="fa-solid fa-ranking-star"></i>
				<p>No level roles configured</p>
				<span>Add your first level role using the form above</span>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.page-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		> i {
			color: #667eea;
			font-size: 1.5rem;
		}

		h1, h2 {
			margin: 0;
			color: #ffffff;
		}

		.count-badge {
			background: rgba(102, 126, 234, 0.2);
			color: #667eea;
			padding: 4px 10px;
			border-radius: 12px;
			font-size: 0.85rem;
			font-weight: 600;
		}
	}

	.section-description {
		color: #8b949e;
		margin-bottom: 2rem;
		margin-left: 36px;
	}

	.create-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.level-role-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 120px 1fr 150px;
		gap: 1rem;
		align-items: end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;

		label {
			display: flex;
			align-items: center;
			gap: 8px;
			font-weight: 600;
			color: #c9d1d9;
			font-size: 0.9rem;

			i {
				color: #667eea;
				width: 16px;
			}
		}
	}

	.multiplier-wrapper {
		position: relative;

		input {
			padding-right: 40px;
		}

		.multiplier-suffix {
			position: absolute;
			right: 16px;
			top: 50%;
			transform: translateY(-50%);
			color: #667eea;
			font-weight: 600;
		}
	}

	.form-info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: rgba(102, 126, 234, 0.1);
		border: 1px solid rgba(102, 126, 234, 0.2);
		border-radius: 8px;
		color: #8b949e;
		font-size: 0.9rem;

		i {
			color: #667eea;
			flex-shrink: 0;
		}
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 14px 28px;
		font-size: 1rem;
		align-self: flex-start;
	}

	/* List Section */
	.list-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.level-roles-table {
		margin-top: 1.5rem;
		border: 1px solid #2d2d44;
		border-radius: 12px;
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 100px 1fr 180px 80px;
		gap: 1rem;
		padding: 14px 20px;
		background: rgba(102, 126, 234, 0.1);
		border-bottom: 1px solid #2d2d44;

		span {
			color: #8b949e;
			font-size: 0.85rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
	}

	.table-row {
		display: grid;
		grid-template-columns: 100px 1fr 180px 80px;
		gap: 1rem;
		padding: 16px 20px;
		align-items: center;
		border-bottom: 1px solid #2d2d44;
		transition: background 0.2s ease;

		&:last-child {
			border-bottom: none;
		}

		&:hover {
			background: rgba(102, 126, 234, 0.05);
		}
	}

	.level-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 6px;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.role-tag {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: rgba(var(--role-color), 0.15);
		border-left: 3px solid var(--role-color, #667eea);
		border-radius: 0 6px 6px 0;
		color: var(--role-color, #c9d1d9);
		font-weight: 500;
		font-size: 0.95rem;

		i {
			font-size: 0.85rem;
			opacity: 0.7;
		}
	}

	.multiplier-edit {
		display: flex;
		align-items: center;
		gap: 8px;

		.adjust-btn {
			width: 32px;
			height: 32px;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(102, 126, 234, 0.15);
			color: #667eea;
			border-radius: 6px;
			font-size: 0.8rem;
			box-shadow: none;

			&:hover:not(:disabled) {
				background: rgba(102, 126, 234, 0.25);
				transform: none;
			}

			&:disabled {
				opacity: 0.3;
				cursor: not-allowed;
			}
		}

		.multiplier-value {
			min-width: 50px;
			text-align: center;
			color: #10b981;
			font-weight: 700;
			font-size: 1rem;
		}
	}

	.col-actions {
		display: flex;
		justify-content: center;
	}

	.delete-btn {
		width: 36px;
		height: 36px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
		border-radius: 8px;
		box-shadow: none;

		&:hover {
			background: rgba(239, 68, 68, 0.25);
			transform: none;
		}
	}

	.multiplier-preview {
		margin-top: 1.5rem;
		padding: 1rem 1.25rem;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 10px;

		h4 {
			display: flex;
			align-items: center;
			gap: 8px;
			margin: 0 0 8px 0;
			color: #10b981;
			font-size: 0.95rem;
		}

		p {
			margin: 0;
			color: #8b949e;
			font-size: 0.9rem;

			strong {
				color: #10b981;
				font-size: 1.1rem;
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #6b7280;
		text-align: center;

		i {
			font-size: 3rem;
			margin-bottom: 1rem;
			color: #4a5568;
		}

		p {
			font-size: 1.1rem;
			font-weight: 600;
			margin: 0 0 0.5rem 0;
			color: #8b949e;
		}

		span {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.table-header {
			display: none;
		}

		.table-row {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.col-level,
		.col-role,
		.col-multiplier,
		.col-actions {
			display: flex;
			justify-content: space-between;
			align-items: center;

			&::before {
				color: #6b7280;
				font-size: 0.8rem;
				font-weight: 600;
				text-transform: uppercase;
			}
		}

		.col-level::before { content: 'Level'; }
		.col-role::before { content: 'Role'; }
		.col-multiplier::before { content: 'Multiplier'; }
		.col-actions::before { content: 'Actions'; }
	}

	@media (max-width: 640px) {
		.create-section,
		.list-section {
			padding: 1.25rem;
		}

		.section-description {
			margin-left: 0;
		}
	}
</style>
