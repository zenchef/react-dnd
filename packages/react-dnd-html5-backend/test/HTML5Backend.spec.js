import HTML5Backend from '../src/HTML5Backend'

describe('The HTML5 Backend', () => {
	describe('window injection', () => {
		it('uses an undefined window when no window is available', () => {
			const mockManager = {
				getActions: () => null,
				getMonitor: () => null,
				getRegistry: () => null,
				getContext: () => ({}),
			}
			const mockWindow = global.window
			try {
				delete global.window
				const backend = new HTML5Backend(mockManager)
				expect(backend).toBeDefined()
				expect(backend.window).toBeUndefined()
			} finally {
				global.window = mockWindow
			}
		})

		it('uses the ambient window global', () => {
			const mockManager = {
				getActions: () => null,
				getMonitor: () => null,
				getRegistry: () => null,
				getContext: () => ({}),
			}
			const backend = new HTML5Backend(mockManager)
			expect(backend).toBeDefined()
			expect(backend.window).toBeDefined()
		})

		it('allows a window to be injected', () => {
			const mockManager = {
				getActions: () => null,
				getMonitor: () => null,
				getRegistry: () => null,
				getContext: () => ({
					window: {
						x: 1,
					},
				}),
			}
			const backend = new HTML5Backend(mockManager)
			expect(backend).toBeDefined()
			expect(backend.window.x).toEqual(1)
		})
	})

	describe('getCurrentDropEffect', () => {
		const mockBackend = () =>
			new HTML5Backend({
				getActions: () => null,
				getRegistry: () => null,
				getContext: () => ({}),
				getMonitor: () => ({
					getSourceId: () => 1,
					isDragging: () => true,
					getItemType: () => 'CARD',
				}),
			})

		it('defaults to move', () => {
			expect(mockBackend().getCurrentDropEffect()).toBe('move')
		})

		it('alt key => copy', () => {
			const backend = mockBackend()
			backend.altKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('copy')
		})

		it('shift key => link', () => {
			const backend = mockBackend()
			backend.shiftKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('link')
		})

		it('ctrl key => none', () => {
			const backend = mockBackend()
			backend.ctrlKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('none')
		})

		it('alt takes priority over shift and ctrl', () => {
			const backend = mockBackend()
			backend.altKeyPressed = true
			backend.shiftKeyPressed = true
			backend.ctrlKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('copy')
		})

		it('a source-supplied dropEffect wins over the modifier keys', () => {
			const backend = mockBackend()
			backend.altKeyPressed = true
			backend.sourceNodeOptions[1] = { dropEffect: 'move' }
			expect(backend.getCurrentDropEffect()).toBe('move')
		})
	})
})
