<script lang="ts">
</script>

<div class="dashboard-home">
	<div class="welcome-section">
		<div class="welcome-icon">
			<i class="fa-solid fa-spa"></i>
		</div>
		<h1>Welcome to Lotus Bot</h1>
		<p>Manage your Lotus Delights Discord server features from this dashboard</p>
	</div>
	
	<div class="feature-cards">
		<a href="/dash/stickymessages" class="feature-card">
			<div class="card-icon sticky">
				<i class="fa-solid fa-thumbtack"></i>
			</div>
			<div class="card-content">
				<h2>Sticky Messages</h2>
				<p>Create and manage persistent messages that stay at the bottom of your Discord channels</p>
			</div>
			<div class="card-arrow">
				<i class="fa-solid fa-arrow-right"></i>
			</div>
		</a>
		
		<a href="/dash/quizzes" class="feature-card">
			<div class="card-icon quiz">
				<i class="fa-solid fa-circle-question"></i>
			</div>
			<div class="card-content">
				<h2>Quizzes</h2>
				<p>Create interactive quizzes and trivia games for your server members to enjoy</p>
			</div>
			<div class="card-arrow">
				<i class="fa-solid fa-arrow-right"></i>
			</div>
		</a>

		<a href="/dash/levelroles" class="feature-card">
			<div class="card-icon levelroles">
				<i class="fa-solid fa-ranking-star"></i>
			</div>
			<div class="card-content">
				<h2>Level Roles & Multipliers</h2>
				<p>Configure roles awarded at specific levels with XP and money multipliers</p>
			</div>
			<div class="card-arrow">
				<i class="fa-solid fa-arrow-right"></i>
			</div>
		</a>

		<a href="/dash/stickyroles" class="feature-card">
			<div class="card-icon stickyroles">
				<i class="fa-solid fa-magnet"></i>
			</div>
			<div class="card-content">
				<h2>Sticky Roles</h2>
				<p>Configure roles that persist when members leave and rejoin the server</p>
			</div>
			<div class="card-arrow">
				<i class="fa-solid fa-arrow-right"></i>
			</div>
		</a>
	</div>

	<div class="stats-section">
		<h3>Quick Stats</h3>
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">
					<i class="fa-brands fa-discord"></i>
				</div>
				<div class="stat-info">
					<span class="stat-label">Server</span>
					<span class="stat-value">Lotus Delights</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon online">
					<i class="fa-solid fa-circle"></i>
				</div>
				<div class="stat-info">
					<span class="stat-label">Bot Status</span>
					<span class="stat-value">Online</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.dashboard-home {
		max-width: 900px;
		margin: 0 auto;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 3rem;

		.welcome-icon {
			width: 80px;
			height: 80px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto 1.5rem;
			box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);

			i {
				font-size: 2.5rem;
				color: white;
			}
		}

		h1 {
			color: #ffffff;
			font-size: 2.2rem;
			margin: 0 0 0.75rem 0;
			font-weight: 700;
		}

		p {
			color: #8b949e;
			font-size: 1.1rem;
			margin: 0;
		}
	}

	.feature-cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.feature-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border: 1px solid #2d2d44;
		border-radius: 16px;
		padding: 1.5rem;
		text-decoration: none;
		transition: all 0.3s ease;

		&:hover {
			border-color: #667eea;
			box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
			transform: translateX(8px);

			.card-arrow {
				opacity: 1;
				transform: translateX(0);
			}
		}
	}

	.card-icon {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		i {
			font-size: 1.5rem;
			color: white;
		}

		&.sticky {
			background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		}

		&.quiz {
			background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		}

		&.levelroles {
			background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
		}

		&.stickyroles {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
	}

	.card-content {
		flex: 1;

		h2 {
			margin: 0 0 0.5rem 0;
			color: #ffffff;
			font-size: 1.2rem;
			font-weight: 600;
		}

		p {
			margin: 0;
			color: #8b949e;
			font-size: 0.95rem;
			line-height: 1.5;
		}
	}

	.card-arrow {
		color: #667eea;
		font-size: 1.2rem;
		opacity: 0;
		transform: translateX(-10px);
		transition: all 0.3s ease;
	}

	.stats-section {
		h3 {
			color: #c9d1d9;
			font-size: 1rem;
			font-weight: 600;
			margin: 0 0 1rem 0;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border: 1px solid #2d2d44;
		border-radius: 12px;
		padding: 1.25rem;

		.stat-icon {
			width: 44px;
			height: 44px;
			background: rgba(102, 126, 234, 0.15);
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;

			i {
				font-size: 1.2rem;
				color: #5865f2;
			}

			&.online i {
				color: #10b981;
				font-size: 0.8rem;
			}
		}

		.stat-info {
			display: flex;
			flex-direction: column;
			gap: 2px;

			.stat-label {
				color: #6b7280;
				font-size: 0.8rem;
			}

			.stat-value {
				color: #ffffff;
				font-weight: 600;
				font-size: 1rem;
			}
		}
	}

	@media (max-width: 640px) {
		.welcome-section {
			.welcome-icon {
				width: 64px;
				height: 64px;

				i {
					font-size: 2rem;
				}
			}

			h1 {
				font-size: 1.75rem;
			}

			p {
				font-size: 1rem;
			}
		}

		.feature-card {
			padding: 1.25rem;

			&:hover {
				transform: none;
			}
		}

		.card-icon {
			width: 48px;
			height: 48px;

			i {
				font-size: 1.25rem;
			}
		}

		.card-arrow {
			display: none;
		}
	}
</style>
