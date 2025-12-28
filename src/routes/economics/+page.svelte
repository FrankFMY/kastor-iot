<script lang="ts">
	import { onMount } from 'svelte';
	import { _, isLoading } from 'svelte-i18n';
	import { Card, Badge } from '$lib/components/ui/index.js';
	import { cn } from '$lib/utils.js';
	import TrendingUp from 'lucide-svelte/icons/trending-up';
	import Fuel from 'lucide-svelte/icons/fuel';
	import Wrench from 'lucide-svelte/icons/wrench';
	import Users from 'lucide-svelte/icons/users';
	import Building from 'lucide-svelte/icons/building-2';
	import Zap from 'lucide-svelte/icons/zap';
	import Calendar from 'lucide-svelte/icons/calendar';

	// Cost breakdown data (mock)
	const costBreakdown = {
		gas: 2.85,
		depreciation: 0.95,
		spare_parts: 0.48,
		labor: 0.48,
		other: 0.24,
		total: 5.0,
		cost_per_kwh: 5.0
	};

	const costItems = [
		{ key: 'gas', label: 'Газ', value: costBreakdown.gas, color: 'bg-orange-500', icon: Fuel },
		{
			key: 'depreciation',
			label: 'Амортизация',
			value: costBreakdown.depreciation,
			color: 'bg-blue-500',
			icon: Building
		},
		{
			key: 'spare_parts',
			label: 'ЗИП',
			value: costBreakdown.spare_parts,
			color: 'bg-emerald-500',
			icon: Wrench
		},
		{ key: 'labor', label: 'ФОТ', value: costBreakdown.labor, color: 'bg-purple-500', icon: Users },
		{
			key: 'other',
			label: 'Прочее',
			value: costBreakdown.other,
			color: 'bg-slate-500',
			icon: TrendingUp
		}
	];

	// Monthly trend data (mock)
	const monthlyTrend = [
		{ month: 'Июл', cost: 4.8, production: 2100 },
		{ month: 'Авг', cost: 4.9, production: 2200 },
		{ month: 'Сен', cost: 5.1, production: 2150 },
		{ month: 'Окт', cost: 4.95, production: 2180 },
		{ month: 'Ноя', cost: 5.0, production: 2250 },
		{ month: 'Дек', cost: 5.2, production: 2300 }
	];

	const maxCost = Math.max(...monthlyTrend.map((m) => m.cost));
	const maxProduction = Math.max(...monthlyTrend.map((m) => m.production));

	// Chart constants
	const chartRadius = 35;
	const chartCircumference = 2 * Math.PI * chartRadius;
	const costTotal = costItems.reduce((sum, item) => sum + item.value, 0);

	function getChartOffset(index: number): number {
		return costItems
			.slice(0, index)
			.reduce((sum, prev) => sum + (prev.value / costTotal) * chartCircumference, 0);
	}
</script>

<div class="mx-auto max-w-6xl space-y-6">
	<!-- Header -->
	<div>
		<h1 class="flex items-center gap-3 text-2xl font-bold text-white">
			<TrendingUp class="h-7 w-7 text-cyan-400" />
			{#if !$isLoading}
				{$_('economics.title')}
			{:else}
				Экономика энергии
			{/if}
		</h1>
		<p class="mt-1 text-sm text-slate-400">Структура себестоимости и анализ затрат</p>
	</div>

	<!-- Main KPI -->
	<div class="grid gap-6 md:grid-cols-3">
		<Card class="relative overflow-hidden">
			<div class="absolute -top-4 -right-4 opacity-10">
				<Zap size={100} />
			</div>
			<h3 class="text-sm font-medium text-slate-400">
				{#if !$isLoading}{$_('economics.costPerKwh')}{:else}Себестоимость кВт·ч{/if}
			</h3>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-4xl font-bold text-white">{costBreakdown.cost_per_kwh.toFixed(2)}</span>
				<span class="text-lg text-slate-500">₽/кВт·ч</span>
			</div>
			<div class="mt-4 text-xs text-slate-500">Средняя за последний месяц</div>
		</Card>

		<Card>
			<h3 class="text-sm font-medium text-slate-400">Выработка за месяц</h3>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-4xl font-bold text-emerald-400">2,300</span>
				<span class="text-lg text-slate-500">МВт·ч</span>
			</div>
			<div class="mt-4 flex items-center gap-2 text-xs text-emerald-400">
				<TrendingUp class="h-4 w-4" />
				+2.2% к прошлому месяцу
			</div>
		</Card>

		<Card>
			<h3 class="text-sm font-medium text-slate-400">Общие затраты</h3>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-4xl font-bold text-amber-400">11.5</span>
				<span class="text-lg text-slate-500">млн ₽</span>
			</div>
			<div class="mt-4 flex items-center gap-2 text-xs text-rose-400">
				<TrendingUp class="h-4 w-4 rotate-180" />
				+4.0% к прошлому месяцу
			</div>
		</Card>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Cost Structure Pie Chart (Redesigned) -->
		<Card class="flex flex-col md:flex-row items-center gap-8 p-8 relative overflow-hidden group col-span-1 lg:col-span-2 xl:col-span-1">
			<!-- Background Glow -->
			<div class="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

			<div class="flex-1 flex justify-center relative">
				<!-- Donut Chart -->
				<div class="relative h-64 w-64">
					<!-- Outer Glow Ring -->
					<div class="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"></div>
					<div class="absolute inset-8 rounded-full border border-white/5"></div>
					
					<svg viewBox="0 0 100 100" class="h-full w-full -rotate-90 drop-shadow-2xl">
						<!-- Track -->
						<circle
							cx="50"
							cy="50"
							r="40"
							fill="transparent"
							stroke-width="10"
							class="stroke-slate-800/50"
						/>
						{#each costItems as item, i}
							{@const percentage = (item.value / costTotal) * 100}
							<!-- Segment -->
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke-width="10"
								class={cn(item.color.replace('bg-', 'stroke-'), "transition-all duration-1000 ease-out hover:opacity-80")}
								stroke-dasharray="{(percentage / 100) * (2 * Math.PI * 40) - 4} {2 * Math.PI * 40}" 
								stroke-dashoffset={-costItems.slice(0, i).reduce((sum, prev) => sum + (prev.value / costTotal) * (2 * Math.PI * 40), 0)}
								stroke-linecap="round"
								style="filter: drop-shadow(0 0 4px rgba(0,0,0,0.4));"
							/>
						{/each}
					</svg>
					<!-- Center Info -->
					<div class="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
						<span class="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Total</span>
						<span class="text-5xl font-bold text-white tracking-tighter filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{costBreakdown.cost_per_kwh}</span>
						<div class="flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm border border-white/10">
							<span class="text-[10px] text-slate-300 font-medium">RUB / kWh</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Legend with Cards -->
			<div class="flex-1 w-full">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-semibold text-white">
						{#if !$isLoading}{$_('economics.costStructure')}{:else}Структура себестоимости{/if}
					</h3>
					<Badge class="bg-slate-900/50 border-slate-700 text-slate-400 pl-2">
						<Calendar class="mr-1 h-3 w-3" />
						Dec 2024
					</Badge>
				</div>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
					{#each costItems as item}
						{@const ItemIcon = item.icon}
						<div class="group/item relative flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-default">
							<!-- Color Line -->
							<div class={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all group-hover/item:w-1.5", item.color)}></div>
							
							<!-- Icon -->
							<div class={cn('h-9 w-9 rounded-lg flex items-center justify-center ml-2 transition-transform group-hover/item:scale-110 duration-300', item.color.replace('bg-', 'bg-') + '/10', item.color.replace('bg-', 'text-'))}>
								<ItemIcon class="h-4.5 w-4.5" />
							</div>
							
							<!-- Text -->
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium text-slate-200 truncate group-hover/item:text-white transition-colors">{item.label}</div>
								<div class="text-xs text-slate-500">{item.value.toFixed(2)} ₽</div>
							</div>
							
							<!-- Percent -->
							<div class="font-mono text-xs font-bold text-slate-300 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
								{((item.value / costBreakdown.total) * 100).toFixed(0)}%
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<!-- Cost Breakdown Details -->
		<Card>
			<h3 class="mb-6 text-lg font-semibold text-white">Детализация затрат</h3>

			<div class="space-y-4">
				{#each costItems as item}
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="mb-2 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class={cn('rounded-lg p-2', item.color.replace('bg-', 'bg-') + '/20')}>
									<item.icon class={cn('h-5 w-5', item.color.replace('bg-', 'text-'))} />
								</div>
								<div>
									<div class="font-medium text-white">{item.label}</div>
									<div class="text-xs text-slate-400">
										{((item.value / costBreakdown.total) * 100).toFixed(1)}% от общих затрат
									</div>
								</div>
							</div>
							<div class="text-right">
								<div class="font-mono text-lg text-white">{item.value.toFixed(2)}</div>
								<div class="text-xs text-slate-400">₽/кВт·ч</div>
							</div>
						</div>
						<div class="h-1.5 overflow-hidden rounded-full bg-slate-700">
							<div
								class={cn('h-full transition-all duration-1000', item.color)}
								style="width: {(item.value / costBreakdown.total) * 100}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	</div>

	<!-- Monthly Trend -->
	<Card>
		<h3 class="mb-6 text-lg font-semibold text-white">
			{#if !$isLoading}{$_('economics.monthlyTrend')}{:else}Динамика затрат{/if}
		</h3>

		<div class="flex h-64 items-end gap-4">
			{#each monthlyTrend as month}
				{@const costHeight = (month.cost / maxCost) * 100}
				{@const prodHeight = (month.production / maxProduction) * 100}
				<div class="group relative flex flex-1 flex-col items-center">
					<!-- Bars -->
					<div class="flex h-48 w-full items-end justify-center gap-1">
						<div
							class="w-1/3 rounded-t bg-cyan-500 transition-all duration-500 group-hover:bg-cyan-400"
							style="height: {costHeight}%"
						></div>
						<div
							class="w-1/3 rounded-t bg-emerald-500/50 transition-all duration-500 group-hover:bg-emerald-400/50"
							style="height: {prodHeight}%"
						></div>
					</div>

					<!-- Month Label -->
					<div class="mt-2 text-xs text-slate-400">{month.month}</div>

					<!-- Tooltip -->
					<div
						class="absolute bottom-full mb-2 hidden rounded-lg border border-white/10 bg-slate-900 p-2 text-xs shadow-xl group-hover:block"
					>
						<div class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-cyan-500"></div>
							<span class="text-slate-400">Себестоимость:</span>
							<span class="text-white">{month.cost} ₽</span>
						</div>
						<div class="mt-1 flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
							<span class="text-slate-400">Выработка:</span>
							<span class="text-white">{month.production} МВт·ч</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Legend -->
		<div class="mt-4 flex justify-center gap-6">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-cyan-500"></div>
				<span class="text-sm text-slate-400">Себестоимость (₽/кВт·ч)</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-emerald-500/50"></div>
				<span class="text-sm text-slate-400">Выработка (МВт·ч)</span>
			</div>
		</div>
	</Card>
</div>
