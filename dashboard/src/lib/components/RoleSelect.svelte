<script lang="ts">
	import { root, token } from '$lib';
	let { roleId = $bindable(), excludeRoles = [] }: { roleId: string | null; excludeRoles?: string[] } = $props();

	let roles: any[] = $state([]);

	token.subscribe(async (val) => {
		if (val) {
			const res = await fetch(`${root}/api/roles`, { headers: { Authorization: $token! } });
			const allRoles = await res.json();
			// Filter out @everyone role and sort by position
			roles = allRoles
				.filter((r: any) => r.name !== '@everyone')
				.sort((a: any, b: any) => b.position - a.position);
		}
	});

	function getFilteredRoles() {
		return roles.filter(r => !excludeRoles.includes(r.id) || r.id === roleId);
	}
</script>

<div class="role-select-wrapper">
	<i class="fa-solid fa-user-tag role-icon"></i>
	<select bind:value={roleId} id="role" name="role">
		<option value="">Select a role...</option>
		{#each getFilteredRoles() as role}
			<option value={role.id} style="color: {role.color ? `#${role.color.toString(16).padStart(6, '0')}` : 'inherit'}">
				{role.name}
			</option>
		{/each}
	</select>
</div>

<style lang="scss">
	.role-select-wrapper {
		position: relative;
		width: 100%;
	}

	.role-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #667eea;
		font-size: 1rem;
		pointer-events: none;
		z-index: 1;
	}

	select {
		width: 100%;
		padding: 14px 18px 14px 44px;
		border: 2px solid #2d2d44;
		border-radius: 8px;
		background-color: #16213e;
		color: #eaeaea;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		outline: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 16px center;
		padding-right: 40px;
	}

	select:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	select:hover {
		border-color: #4a5568;
	}

	select option {
		background-color: #16213e;
		color: #eaeaea;
		padding: 12px;
	}
</style>
