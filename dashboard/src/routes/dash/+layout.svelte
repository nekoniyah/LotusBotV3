<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	const { children } = $props();

	let isMobileMenuOpen = $state(false);

	function isActive(path: string) {
		return $page.url.pathname === path;
	}

	function navigate(path: string) {
		goto(path);
		isMobileMenuOpen = false;
	}
</script>

<div class="dashboard-wrapper">
	<!-- Mobile Header -->
	<header class="mobile-header">
		<div class="logo-section">
			<i class="fa-solid fa-spa"></i>
			<span>Lotus Bot</span>
		</div>
		<button class="menu-toggle" onclick={() => isMobileMenuOpen = !isMobileMenuOpen}>
			<i class={isMobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
		</button>
	</header>

	<!-- Sidebar -->
	<nav class="sidebar" class:open={isMobileMenuOpen}>
		<div class="sidebar-header">
			<div class="logo">
				<i class="fa-solid fa-spa"></i>
				<span>Lotus Bot</span>
			</div>
			<p class="subtitle">Dashboard</p>
		</div>

		<div class="nav-section">
			<span class="nav-label">General</span>
			<ul class="nav-list">
				<li>
					<button 
						class="nav-item" 
						class:active={isActive('/dash')}
						onclick={() => navigate('/dash')}
					>
						<i class="fa-solid fa-house"></i>
						<span>Home</span>
					</button>
				</li>
			</ul>

			<span class="nav-label" style="margin-top: 1.5rem;">Content</span>
			<ul class="nav-list">
				<li>
					<button 
						class="nav-item"
						class:active={isActive('/dash/stickymessages')}
						onclick={() => navigate('/dash/stickymessages')}
					>
						<i class="fa-solid fa-thumbtack"></i>
						<span>Sticky Messages</span>
					</button>
				</li>
				<li>
					<button 
						class="nav-item"
						class:active={isActive('/dash/quizzes')}
						onclick={() => navigate('/dash/quizzes')}
					>
						<i class="fa-solid fa-circle-question"></i>
						<span>Quizzes</span>
					</button>
				</li>
			</ul>

			<span class="nav-label" style="margin-top: 1.5rem;">Leveling & Economy</span>
			<ul class="nav-list">
				<li>
					<button 
						class="nav-item"
						class:active={isActive('/dash/levelroles')}
						onclick={() => navigate('/dash/levelroles')}
					>
						<i class="fa-solid fa-ranking-star"></i>
						<span>Level Roles</span>
					</button>
				</li>
			</ul>
		</div>

		<div class="sidebar-footer">
			<div class="server-info">
				<i class="fa-brands fa-discord"></i>
				<span>Lotus Delights</span>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="content">
		{@render children()}
	</main>
</div>

<!-- Overlay for mobile -->
{#if isMobileMenuOpen}
	<div class="overlay" onclick={() => isMobileMenuOpen = false}></div>
{/if}

<style lang="scss">
	.dashboard-wrapper {
		display: flex;
		min-height: 100vh;
	}

	/* Mobile Header */
	.mobile-header {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		border-bottom: 1px solid #2d2d44;
		padding: 0 1rem;
		align-items: center;
		justify-content: space-between;
		z-index: 100;

		.logo-section {
			display: flex;
			align-items: center;
			gap: 10px;
			color: #ffffff;
			font-weight: 700;
			font-size: 1.1rem;

			i {
				color: #667eea;
				font-size: 1.3rem;
			}
		}

		.menu-toggle {
			background: transparent;
			border: none;
			color: #ffffff;
			font-size: 1.3rem;
			padding: 8px;
			cursor: pointer;
			box-shadow: none;

			&:hover {
				color: #667eea;
				transform: none;
				box-shadow: none;
			}
		}
	}

	/* Sidebar */
	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
		border-right: 1px solid #2d2d44;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		z-index: 200;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid #2d2d44;

		.logo {
			display: flex;
			align-items: center;
			gap: 12px;
			color: #ffffff;
			font-weight: 700;
			font-size: 1.3rem;

			i {
				color: #667eea;
				font-size: 1.8rem;
			}
		}

		.subtitle {
			margin: 8px 0 0 0;
			color: #6b7280;
			font-size: 0.85rem;
			margin-left: 42px;
		}
	}

	.nav-section {
		flex: 1;
		padding: 1.5rem 1rem;
		overflow-y: auto;
	}

	.nav-label {
		display: block;
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.75rem;
		padding-left: 0.5rem;
	}

	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: #c9d1d9;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		box-shadow: none;

		i {
			width: 20px;
			text-align: center;
			font-size: 1rem;
			color: #8b949e;
			transition: color 0.2s ease;
		}

		&:hover {
			background: rgba(102, 126, 234, 0.1);
			color: #ffffff;
			transform: none;
			box-shadow: none;

			i {
				color: #667eea;
			}
		}

		&.active {
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
			color: #ffffff;
			border-left: 3px solid #667eea;
			padding-left: 13px;

			i {
				color: #667eea;
			}
		}
	}

	.sidebar-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #2d2d44;

		.server-info {
			display: flex;
			align-items: center;
			gap: 10px;
			color: #8b949e;
			font-size: 0.9rem;

			i {
				color: #5865f2;
				font-size: 1.2rem;
			}
		}
	}

	/* Content */
	.content {
		flex: 1;
		margin-left: 260px;
		padding: 2rem;
		min-height: 100vh;
		background: #1a1a2e;
	}

	/* Overlay */
	.overlay {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 150;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.mobile-header {
			display: flex;
		}

		.sidebar {
			transform: translateX(-100%);
			transition: transform 0.3s ease;

			&.open {
				transform: translateX(0);
			}
		}

		.content {
			margin-left: 0;
			padding-top: 80px;
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.overlay {
			display: block;
		}
	}
</style>
