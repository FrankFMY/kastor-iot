<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { Card, Badge, Button, Modal } from '$lib/components/ui/index.js';
	import { cn } from '$lib/utils.js';
	import Settings from 'lucide-svelte/icons/settings';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Bell from 'lucide-svelte/icons/bell';
	import Mail from 'lucide-svelte/icons/mail';
	import Smartphone from 'lucide-svelte/icons/smartphone';
	import BellRing from 'lucide-svelte/icons/bell-ring';
	import Plus from 'lucide-svelte/icons/plus';
	import { getAlertRules, toggleAlertRule, createAlertRule } from '$lib/services/alerts.service.js';
	import type { AlertRule, AlertSeverity } from '$lib/types/alert.js';
	import { _, isLoading } from 'svelte-i18n';

	let rules: AlertRule[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);

	// Form state
	let newRule = $state({
		name: '',
		engine_id: '',
		metric: 'temp_exhaust',
		operator: 'gt' as 'gt' | 'lt' | 'gte' | 'lte' | 'eq',
		threshold: 0,
		duration_seconds: 60,
		severity: 'warning' as AlertSeverity,
		notify_email: true,
		notify_sms: false,
		notify_push: true
	});

	function resetForm() {
		newRule = {
			name: '',
			engine_id: '',
			metric: 'temp_exhaust',
			operator: 'gt',
			threshold: 0,
			duration_seconds: 60,
			severity: 'warning',
			notify_email: true,
			notify_sms: false,
			notify_push: true
		};
	}

	async function handleCreateRule() {
		await createAlertRule({
			name: newRule.name,
			engine_id: newRule.engine_id || null,
			metric: newRule.metric,
			operator: newRule.operator,
			threshold: newRule.threshold,
			duration_seconds: newRule.duration_seconds,
			severity: newRule.severity,
			notify_email: newRule.notify_email,
			notify_sms: newRule.notify_sms,
			notify_push: newRule.notify_push
		});

		showCreateModal = false;
		resetForm();
		await loadRules();
	}

	async function loadRules() {
		loading = true;
		try {
			rules = await getAlertRules();
		} finally {
			loading = false;
		}
	}

	async function handleToggle(ruleId: string) {
		await toggleAlertRule(ruleId);
		await loadRules();
	}

	onMount(() => {
		loadRules();
	});

	function getOperatorLabel(op: string) {
		switch (op) {
			case 'gt':
				return '>';
			case 'lt':
				return '<';
			case 'gte':
				return '≥';
			case 'lte':
				return '≤';
			case 'eq':
				return '=';
			default:
				return op;
		}
	}

	function getMetricLabel(metric: string): string {
		if ($isLoading) return metric;
		const key = `alertRules.metrics.${metric}`;
		return $_(key);
	}

	function getSeverityColor(severity: string) {
		switch (severity) {
			case 'critical':
				return 'danger';
			case 'warning':
				return 'warning';
			default:
				return 'info';
		}
	}
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<a
			href="{base}/alerts"
			class="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
		>
			<ArrowLeft class="h-5 w-5" />
		</a>
		<div>
			<h1 class="flex items-center gap-3 text-2xl font-bold text-white">
				<Settings class="h-7 w-7 text-cyan-400" />
				{#if !$isLoading}{$_('alertRules.title')}{:else}Правила алертов{/if}
			</h1>
			<p class="mt-1 text-sm text-slate-400">
				{#if !$isLoading}{$_('alertRules.subtitle')}{:else}Настройка порогов и уведомлений{/if}
			</p>
		</div>
	</div>

	<!-- Add Rule Button -->
	<div class="flex justify-end">
		<Button class="gap-2" onclick={() => (showCreateModal = true)}>
			<Plus class="h-4 w-4" />
			{#if !$isLoading}{$_('alertRules.addRule')}{:else}Добавить правило{/if}
		</Button>
	</div>

	<!-- Rules List -->
	<div class="space-y-4">
		{#if loading}
			{#each { length: 3 } as _item, i (i)}
				<Card class="animate-pulse">
					<div class="h-20"></div>
				</Card>
			{/each}
		{:else}
			{#each rules as rule (rule.id)}
				<Card class={cn('transition', !rule.enabled && 'opacity-50')}>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<h3 class="font-semibold text-white">{rule.name}</h3>
								<Badge variant={getSeverityColor(rule.severity)}>
									{rule.severity}
								</Badge>
								{#if rule.engine_id}
									<Badge variant="default">{rule.engine_id.toUpperCase()}</Badge>
								{:else}
									<Badge variant="secondary">
										{#if !$isLoading}{$_('alertRules.allEngines')}{:else}Все двигатели{/if}
									</Badge>
								{/if}
							</div>

							<div class="mb-3 text-sm text-slate-400">
								<span class="font-medium text-slate-300">{getMetricLabel(rule.metric)}</span>
								<span class="mx-2 font-mono text-cyan-400">{getOperatorLabel(rule.operator)}</span>
								<span class="font-mono text-white">{rule.threshold}</span>
								<span class="ml-2 text-slate-500">for {rule.duration_seconds}s</span>
							</div>

							<div class="flex items-center gap-4">
								<div
									class={cn(
										'flex items-center gap-1 text-xs',
										rule.notify_email ? 'text-cyan-400' : 'text-slate-600'
									)}
								>
									<Mail class="h-3.5 w-3.5" />
									{#if !$isLoading}{$_('alertRules.channels.email')}{:else}Email{/if}
								</div>
								<div
									class={cn(
										'flex items-center gap-1 text-xs',
										rule.notify_sms ? 'text-cyan-400' : 'text-slate-600'
									)}
								>
									<Smartphone class="h-3.5 w-3.5" />
									{#if !$isLoading}{$_('alertRules.channels.sms')}{:else}SMS{/if}
								</div>
								<div
									class={cn(
										'flex items-center gap-1 text-xs',
										rule.notify_push ? 'text-cyan-400' : 'text-slate-600'
									)}
								>
									<BellRing class="h-3.5 w-3.5" />
									{#if !$isLoading}{$_('alertRules.channels.push')}{:else}Push{/if}
								</div>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<button
								type="button"
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-hidden {rule.enabled
									? 'bg-cyan-500'
									: 'bg-slate-700'}"
								onclick={() => handleToggle(rule.id)}
								aria-label="Toggle rule"
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {rule.enabled
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>
				</Card>
			{/each}
		{/if}
	</div>

	<!-- Info Card -->
	<Card class="border-cyan-500/20 bg-cyan-500/5">
		<div class="flex gap-4">
			<Bell class="h-5 w-5 shrink-0 text-cyan-400" />
			<div class="text-sm text-slate-300">
				<p class="mb-2 font-medium">
					{#if !$isLoading}{$_('alertRules.howItWorks')}{:else}Как работают правила{/if}
				</p>
				<p class="text-slate-400">
					{#if !$isLoading}{$_('alertRules.howItWorksDesc')}{:else}Когда метрика превышает
						установленный порог в течение указанного времени, срабатывает алерт.{/if}
				</p>
			</div>
		</div>
	</Card>
</div>

<!-- Create Alert Rule Modal -->
<Modal
	open={showCreateModal}
	title={$isLoading ? 'Создать правило' : $_('alertRules.createRule')}
	onclose={() => (showCreateModal = false)}
	size="lg"
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleCreateRule();
		}}
		class="space-y-4"
	>
		<div>
			<label for="rule-name" class="mb-1 block text-sm font-medium text-slate-300">
				{#if !$isLoading}{$_('alertRules.form.name')}{:else}Название *{/if}
			</label>
			<input
				id="rule-name"
				type="text"
				bind:value={newRule.name}
				placeholder={$isLoading
					? 'Например: Высокая температура'
					: $_('alertRules.form.namePlaceholder')}
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
				required
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="rule-engine" class="mb-1 block text-sm font-medium text-slate-300">
					{#if !$isLoading}{$_('alertRules.form.engine')}{:else}Двигатель{/if}
				</label>
				<select
					id="rule-engine"
					bind:value={newRule.engine_id}
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
				>
					<option value=""
						>{#if !$isLoading}{$_('alertRules.allEngines')}{:else}Все двигатели{/if}</option
					>
					<option value="gpu-1">GPU-1</option>
					<option value="gpu-2">GPU-2</option>
					<option value="gpu-3">GPU-3</option>
					<option value="gpu-4">GPU-4</option>
				</select>
			</div>

			<div>
				<label for="rule-metric" class="mb-1 block text-sm font-medium text-slate-300">
					{#if !$isLoading}{$_('alertRules.form.metric')}{:else}Метрика *{/if}
				</label>
				<select
					id="rule-metric"
					bind:value={newRule.metric}
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
					required
				>
					<option value="temp_exhaust"
						>{#if !$isLoading}{$_('alertRules.metrics.temp_exhaust')}{:else}Температура выхлопа{/if}</option
					>
					<option value="vibration"
						>{#if !$isLoading}{$_('alertRules.metrics.vibration')}{:else}Вибрация{/if}</option
					>
					<option value="power_kw"
						>{#if !$isLoading}{$_('alertRules.metrics.power_kw')}{:else}Мощность{/if}</option
					>
					<option value="gas_pressure"
						>{#if !$isLoading}{$_('alertRules.metrics.gas_pressure')}{:else}Давление газа{/if}</option
					>
					<option value="total_hours"
						>{#if !$isLoading}{$_('alertRules.metrics.total_hours')}{:else}Моточасы{/if}</option
					>
				</select>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-4">
			<div>
				<label for="rule-operator" class="mb-1 block text-sm font-medium text-slate-300">
					{#if !$isLoading}{$_('alertRules.form.condition')}{:else}Условие *{/if}
				</label>
				<select
					id="rule-operator"
					bind:value={newRule.operator}
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
					required
				>
					<option value="gt"
						>{#if !$isLoading}{$_('alertRules.operators.gt')}{:else}Больше (&gt;){/if}</option
					>
					<option value="gte"
						>{#if !$isLoading}{$_('alertRules.operators.gte')}{:else}Больше или равно (≥){/if}</option
					>
					<option value="lt"
						>{#if !$isLoading}{$_('alertRules.operators.lt')}{:else}Меньше (&lt;){/if}</option
					>
					<option value="lte"
						>{#if !$isLoading}{$_('alertRules.operators.lte')}{:else}Меньше или равно (≤){/if}</option
					>
					<option value="eq"
						>{#if !$isLoading}{$_('alertRules.operators.eq')}{:else}Равно (=){/if}</option
					>
				</select>
			</div>

			<div>
				<label for="rule-threshold" class="mb-1 block text-sm font-medium text-slate-300">
					{#if !$isLoading}{$_('alertRules.form.threshold')}{:else}Порог *{/if}
				</label>
				<input
					id="rule-threshold"
					type="number"
					step="any"
					bind:value={newRule.threshold}
					placeholder="530"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
					required
				/>
			</div>

			<div>
				<label for="rule-duration" class="mb-1 block text-sm font-medium text-slate-300">
					{#if !$isLoading}{$_('alertRules.form.duration')}{:else}Длительность (сек) *{/if}
				</label>
				<input
					id="rule-duration"
					type="number"
					bind:value={newRule.duration_seconds}
					placeholder="60"
					min="1"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
					required
				/>
			</div>
		</div>

		<div>
			<label for="rule-severity" class="mb-1 block text-sm font-medium text-slate-300">
				{#if !$isLoading}{$_('alerts.severityLabel')}{:else}Критичность *{/if}
			</label>
			<select
				id="rule-severity"
				bind:value={newRule.severity}
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
				required
			>
				<option value="info"
					>{#if !$isLoading}{$_('alerts.severity.info')}{:else}Информация{/if}</option
				>
				<option value="warning"
					>{#if !$isLoading}{$_('alerts.severity.warning')}{:else}Предупреждение{/if}</option
				>
				<option value="critical"
					>{#if !$isLoading}{$_('alerts.severity.critical')}{:else}Критический{/if}</option
				>
			</select>
		</div>

		<fieldset>
			<legend class="mb-2 block text-sm font-medium text-slate-300">
				{#if !$isLoading}{$_('alertRules.notificationChannels')}{:else}Каналы уведомлений{/if}
			</legend>
			<div class="flex flex-wrap gap-4">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={newRule.notify_email}
						class="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
					/>
					<Mail class="h-4 w-4 text-slate-400" />
					<span class="text-sm text-slate-300"
						>{#if !$isLoading}{$_('alertRules.channels.email')}{:else}Email{/if}</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={newRule.notify_sms}
						class="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
					/>
					<Smartphone class="h-4 w-4 text-slate-400" />
					<span class="text-sm text-slate-300"
						>{#if !$isLoading}{$_('alertRules.channels.sms')}{:else}SMS{/if}</span
					>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={newRule.notify_push}
						class="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
					/>
					<BellRing class="h-4 w-4 text-slate-400" />
					<span class="text-sm text-slate-300"
						>{#if !$isLoading}{$_('alertRules.channels.push')}{:else}Push{/if}</span
					>
				</label>
			</div>
		</fieldset>

		<div class="flex justify-end gap-3 border-t border-white/5 pt-4">
			<Button
				type="button"
				variant="secondary"
				onclick={() => {
					showCreateModal = false;
					resetForm();
				}}
			>
				{#if !$isLoading}{$_('common.cancel')}{:else}Отмена{/if}
			</Button>
			<Button type="submit">
				{#if !$isLoading}{$_('alertRules.createRule')}{:else}Создать правило{/if}
			</Button>
		</div>
	</form>
</Modal>
