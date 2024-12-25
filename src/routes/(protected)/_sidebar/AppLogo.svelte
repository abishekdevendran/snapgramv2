<script>
	import * as Sidebar from '$lib/components/ui/sidebar';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<Sidebar.MenuButton
			size="lg"
			class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
		>
			<img alt="SnapGram V2" src="favicon.svg" class="h-8 w-8 rounded-lg invert-0" />
      <div class="grid flex-1 text-left text-sm leading-tight">
        <span class="truncate font-semibold text-xl">SnapGram V2</span>
      </div>
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Menu>