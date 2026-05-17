<script lang="ts">
	import { goto } from '$app/navigation';
	import { root, token } from '$lib';

	let quizzes: any[] = $state([]);

	let newQuiz = $state({
		question: '',
		options: [] as string[],
		answer: ''
	});

	let optionInput = $state('');
	let isSubmitting = $state(false);

	async function loadQuizzes() {
		const res = await fetch(`${root}/api/quizzes`, {
			headers: {
				Authorization: $token!
			}
		});

		if (res.status === 401) {
			localStorage.removeItem('token');
			await goto('/login');
			return;
		}

		const q = await res.json();
		quizzes = q;
	}

	token.subscribe(async (t) => {
		if (t) await loadQuizzes();
	});

	async function onDelete(question: string) {
		const res = await fetch(`${root}/api/quizzes`, {
			method: 'DELETE',
			headers: {
				Authorization: $token!,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ question })
		});

		if (res.status === 200) {
			await loadQuizzes();
		}
	}

	function addOption() {
		const trimmed = optionInput.trim();
		if (trimmed && !newQuiz.options.includes(trimmed)) {
			newQuiz.options = [...newQuiz.options, trimmed];
			optionInput = '';
		}
	}

	function removeOption(optionToRemove: string) {
		newQuiz.options = newQuiz.options.filter((o) => o !== optionToRemove);
		// If removed option was the answer, clear the answer
		if (newQuiz.answer === optionToRemove) {
			newQuiz.answer = '';
		}
	}

	function selectAsAnswer(option: string) {
		newQuiz.answer = option;
	}

	async function onSubmit(ev: SubmitEvent) {
		ev.preventDefault();
		
		if (!newQuiz.question.trim() || newQuiz.options.length < 2 || !newQuiz.answer.trim()) {
			return;
		}

		isSubmitting = true;

		try {
			const res = await fetch(`${root}/api/quizzes`, {
				method: 'POST',
				headers: {
					Authorization: $token!,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newQuiz)
			});

			if (res.ok) {
				newQuiz = { question: '', options: [], answer: '' };
				optionInput = '';
				await loadQuizzes();
			}
		} finally {
			isSubmitting = false;
		}
	}

	function handleOptionKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addOption();
		}
	}

	$effect(() => {
		// If answer is not in options list, clear it
		if (newQuiz.answer && !newQuiz.options.includes(newQuiz.answer)) {
			newQuiz.answer = '';
		}
	});
</script>

<div class="page-container">
	<!-- Create Quiz Section -->
	<div class="create-section">
		<div class="section-header">
			<i class="fa-solid fa-circle-question"></i>
			<h1>Create a Quiz</h1>
		</div>
		<p class="section-description">Create interactive quizzes for your server members</p>
		
		<form class="quiz-form" onsubmit={onSubmit}>
			<!-- Step 1: Question -->
			<div class="form-step">
				<div class="step-header">
					<span class="step-number">1</span>
					<label for="question">Write your question</label>
				</div>
				<input 
					type="text" 
					id="question" 
					placeholder="e.g., What is the capital of France?"
					bind:value={newQuiz.question}
					required
				/>
			</div>

			<!-- Step 2: Options -->
			<div class="form-step">
				<div class="step-header">
					<span class="step-number">2</span>
					<label>Add answer options <span class="hint">(minimum 2)</span></label>
				</div>
				
				<div class="option-input-row">
					<input 
						type="text" 
						placeholder="Type an option and press Enter or click Add"
						bind:value={optionInput}
						onkeydown={handleOptionKeydown}
					/>
					<button type="button" class="add-btn" onclick={addOption} disabled={!optionInput.trim()}>
						<i class="fa-solid fa-plus"></i>
						Add
					</button>
				</div>
				
				{#if newQuiz.options.length > 0}
					<div class="options-container">
						{#each newQuiz.options as opt, index}
							<div class="option-item" class:is-answer={newQuiz.answer === opt}>
								<div class="option-left">
									<span class="option-letter">{String.fromCharCode(65 + index)}</span>
									<span class="option-text">{opt}</span>
								</div>
								<div class="option-actions">
									<button 
										type="button" 
										class="mark-correct-btn"
										class:selected={newQuiz.answer === opt}
										onclick={() => selectAsAnswer(opt)}
										title="Mark as correct answer"
									>
										<i class="fa-solid fa-check"></i>
									</button>
									<button 
										type="button" 
										class="remove-btn"
										onclick={() => removeOption(opt)}
										title="Remove option"
									>
										<i class="fa-solid fa-xmark"></i>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="options-placeholder">
						<i class="fa-solid fa-list-ul"></i>
						<p>No options added yet</p>
						<span>Add at least 2 answer options for your quiz</span>
					</div>
				{/if}
			</div>

			<!-- Step 3: Correct Answer -->
			<div class="form-step">
				<div class="step-header">
					<span class="step-number">3</span>
					<label>Select the correct answer</label>
				</div>
				
				{#if newQuiz.options.length > 0}
					<div class="answer-selector">
						{#each newQuiz.options as opt}
							<button 
								type="button"
								class="answer-option"
								class:selected={newQuiz.answer === opt}
								onclick={() => selectAsAnswer(opt)}
							>
								<span class="radio-circle">
									{#if newQuiz.answer === opt}
										<i class="fa-solid fa-check"></i>
									{/if}
								</span>
								<span>{opt}</span>
							</button>
						{/each}
					</div>
				{:else}
					<div class="answer-placeholder">
						<p>Add options first to select the correct answer</p>
					</div>
				{/if}
			</div>

			<!-- Submit -->
			<div class="form-actions">
				<button 
					type="submit" 
					class="submit-btn"
					disabled={!newQuiz.question.trim() || newQuiz.options.length < 2 || !newQuiz.answer || isSubmitting}
				>
					{#if isSubmitting}
						<i class="fa-solid fa-spinner fa-spin"></i>
						Creating...
					{:else}
						<i class="fa-solid fa-plus"></i>
						Create Quiz
					{/if}
				</button>
				
				{#if newQuiz.question || newQuiz.options.length > 0}
					<button 
						type="button" 
						class="clear-btn"
						onclick={() => { newQuiz = { question: '', options: [], answer: '' }; optionInput = ''; }}
					>
						<i class="fa-solid fa-eraser"></i>
						Clear Form
					</button>
				{/if}
			</div>

			<!-- Validation Messages -->
			{#if newQuiz.question && newQuiz.options.length > 0 && newQuiz.options.length < 2}
				<p class="validation-msg">
					<i class="fa-solid fa-circle-exclamation"></i>
					Add at least one more option
				</p>
			{/if}
			{#if newQuiz.question && newQuiz.options.length >= 2 && !newQuiz.answer}
				<p class="validation-msg">
					<i class="fa-solid fa-circle-exclamation"></i>
					Select the correct answer from the options above
				</p>
			{/if}
		</form>
	</div>

	<!-- Existing Quizzes Section -->
	<div class="list-section">
		<div class="section-header">
			<i class="fa-solid fa-clipboard-list"></i>
			<h2>Existing Quizzes</h2>
			{#if quizzes.length > 0}
				<span class="count-badge">{quizzes.length}</span>
			{/if}
		</div>

		{#if quizzes.length > 0}
			<div class="quiz-list">
				{#each quizzes as quiz}
					<div class="quiz-card">
						<div class="quiz-header">
							<div class="quiz-question">
								<i class="fa-solid fa-circle-question"></i>
								<h3>{quiz.question}</h3>
							</div>
							<button 
								class="delete-btn" 
								onclick={() => onDelete(quiz.question)}
								title="Delete quiz"
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
						<div class="quiz-body">
							{#if quiz.options && quiz.options.length > 0}
								<div class="quiz-options">
									{#each quiz.options as opt, i}
										<span class="option-badge" class:correct={opt === quiz.answer}>
											<span class="badge-letter">{String.fromCharCode(65 + i)}</span>
											{opt}
											{#if opt === quiz.answer}
												<i class="fa-solid fa-check"></i>
											{/if}
										</span>
									{/each}
								</div>
							{:else}
								<div class="quiz-answer-only">
									<span class="answer-label">
										<i class="fa-solid fa-check-circle"></i>
										Answer:
									</span>
									<span class="answer-value">{quiz.answer}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<i class="fa-solid fa-clipboard-question"></i>
				<p>No quizzes yet</p>
				<span>Create your first quiz using the form above</span>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.page-container {
		max-width: 800px;
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

	.quiz-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-step {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: 12px;

		.step-number {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border-radius: 50%;
			font-size: 0.85rem;
			font-weight: 700;
		}

		label {
			font-weight: 600;
			color: #c9d1d9;
			font-size: 1rem;
			margin: 0;

			.hint {
				color: #6b7280;
				font-weight: 400;
				font-size: 0.9rem;
			}
		}
	}

	.option-input-row {
		display: flex;
		gap: 10px;

		input {
			flex: 1;
		}

		.add-btn {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 12px 20px;
			white-space: nowrap;
			flex-shrink: 0;
		}
	}

	.options-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}

	.option-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		border-radius: 10px;
		padding: 12px 16px;
		transition: all 0.2s ease;

		&:hover {
			border-color: #4a5568;
		}

		&.is-answer {
			border-color: #10b981;
			background: rgba(16, 185, 129, 0.1);
		}
	}

	.option-left {
		display: flex;
		align-items: center;
		gap: 12px;

		.option-letter {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			background: rgba(102, 126, 234, 0.2);
			color: #667eea;
			border-radius: 6px;
			font-size: 0.85rem;
			font-weight: 700;
		}

		.option-text {
			color: #e0e0e0;
			font-size: 0.95rem;
		}
	}

	.option-actions {
		display: flex;
		gap: 6px;

		button {
			width: 32px;
			height: 32px;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 6px;
			font-size: 0.85rem;
			box-shadow: none;

			&:hover {
				transform: none;
			}
		}

		.mark-correct-btn {
			background: rgba(16, 185, 129, 0.15);
			color: #6b7280;
			border: 1px solid transparent;

			&:hover {
				background: rgba(16, 185, 129, 0.25);
				color: #10b981;
			}

			&.selected {
				background: #10b981;
				color: white;
			}
		}

		.remove-btn {
			background: rgba(239, 68, 68, 0.15);
			color: #6b7280;

			&:hover {
				background: rgba(239, 68, 68, 0.25);
				color: #ef4444;
			}
		}
	}

	.options-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: rgba(22, 33, 62, 0.5);
		border: 2px dashed #2d2d44;
		border-radius: 10px;
		color: #6b7280;
		text-align: center;

		i {
			font-size: 2rem;
			margin-bottom: 0.75rem;
			color: #4a5568;
		}

		p {
			margin: 0 0 0.25rem 0;
			font-weight: 600;
			color: #8b949e;
		}

		span {
			font-size: 0.9rem;
		}
	}

	.answer-selector {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.answer-option {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		padding: 14px 18px;
		border-radius: 10px;
		color: #c9d1d9;
		font-size: 0.95rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: none;

		&:hover {
			border-color: #667eea;
			background: rgba(102, 126, 234, 0.05);
			transform: none;
		}

		&.selected {
			border-color: #10b981;
			background: rgba(16, 185, 129, 0.1);

			.radio-circle {
				background: #10b981;
				border-color: #10b981;
				color: white;
			}
		}

		.radio-circle {
			width: 24px;
			height: 24px;
			border: 2px solid #4a5568;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			transition: all 0.2s ease;

			i {
				font-size: 0.7rem;
			}
		}
	}

	.answer-placeholder {
		padding: 1.5rem;
		background: rgba(22, 33, 62, 0.5);
		border: 2px dashed #2d2d44;
		border-radius: 10px;
		text-align: center;

		p {
			margin: 0;
			color: #6b7280;
			font-size: 0.95rem;
		}
	}

	.form-actions {
		display: flex;
		gap: 12px;
		padding-top: 0.5rem;

		.submit-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10px;
			padding: 14px 28px;
			font-size: 1rem;
		}

		.clear-btn {
			display: flex;
			align-items: center;
			gap: 8px;
			background: transparent;
			border: 1px solid #4a5568;
			color: #8b949e;
			padding: 14px 20px;
			box-shadow: none;

			&:hover {
				border-color: #667eea;
				color: #c9d1d9;
				transform: none;
			}
		}
	}

	.validation-msg {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 12px 16px;
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 8px;
		color: #fbbf24;
		font-size: 0.9rem;

		i {
			font-size: 1rem;
		}
	}

	/* List Section */
	.list-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.quiz-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.quiz-card {
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s ease;

		&:hover {
			border-color: #667eea;
			box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
		}
	}

	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: rgba(102, 126, 234, 0.1);
		border-bottom: 1px solid #2d2d44;
	}

	.quiz-question {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		flex: 1;

		> i {
			color: #667eea;
			font-size: 1.1rem;
			margin-top: 3px;
			flex-shrink: 0;
		}

		h3 {
			margin: 0;
			color: #ffffff;
			font-size: 1rem;
			line-height: 1.4;
			font-weight: 600;
		}
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
		flex-shrink: 0;
		box-shadow: none;

		&:hover {
			background: rgba(239, 68, 68, 0.25);
			transform: none;
		}
	}

	.quiz-body {
		padding: 1.25rem;
	}

	.quiz-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.option-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(75, 85, 99, 0.4);
		color: #c9d1d9;
		padding: 8px 14px;
		border-radius: 8px;
		font-size: 0.9rem;

		.badge-letter {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 20px;
			height: 20px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 700;
		}

		&.correct {
			background: rgba(16, 185, 129, 0.2);
			color: #10b981;
			border: 1px solid rgba(16, 185, 129, 0.3);

			.badge-letter {
				background: rgba(16, 185, 129, 0.3);
			}

			i {
				font-size: 0.8rem;
			}
		}
	}

	.quiz-answer-only {
		display: flex;
		align-items: center;
		gap: 10px;

		.answer-label {
			display: flex;
			align-items: center;
			gap: 6px;
			color: #8b949e;
			font-size: 0.9rem;

			i {
				color: #10b981;
			}
		}

		.answer-value {
			color: #10b981;
			font-weight: 600;
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

	@media (max-width: 640px) {
		.create-section,
		.list-section {
			padding: 1.25rem;
		}

		.section-description {
			margin-left: 0;
		}

		.option-input-row {
			flex-direction: column;

			.add-btn {
				justify-content: center;
			}
		}

		.form-actions {
			flex-direction: column;

			.submit-btn,
			.clear-btn {
				justify-content: center;
			}
		}

		.option-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;

			.option-actions {
				align-self: flex-end;
			}
		}
	}
</style>
