import HTML5Backend from '../src/HTML5Backend'
import * as NativeTypes from '../src/NativeTypes'

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

	const mockBackend = ({ itemType = 'CARD' } = {}) =>
		new HTML5Backend({
			getActions: () => ({ hover: () => {} }),
			getRegistry: () => null,
			getContext: () => ({}),
			getMonitor: () => ({
				getSourceId: () => 1,
				isDragging: () => true,
				getItemType: () => itemType,
				canDropOnTarget: () => true,
			}),
		})

	describe('getCurrentDropEffect', () => {
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

		it('does not mutate sourceNodeOptions, so modifier keys keep working across reads', () => {
			const backend = mockBackend()
			backend.sourceNodeOptions[1] = { captureDraggingState: true }
			expect(backend.getCurrentDropEffect()).toBe('move')
			backend.altKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('copy')
		})

		it('a native item drag always reports copy, whatever the modifier keys', () => {
			const backend = mockBackend({ itemType: NativeTypes.FILE })
			backend.ctrlKeyPressed = true
			expect(backend.getCurrentDropEffect()).toBe('copy')
		})
	})

	describe('getCurrentSourcePreviewNodeOptions', () => {
		it('does not mutate the options the consumer passed to connectDragPreview', () => {
			const backend = mockBackend()
			const consumerOptions = { anchorX: 0 }
			backend.sourcePreviewNodeOptions[1] = consumerOptions
			backend.getCurrentSourcePreviewNodeOptions()
			expect(consumerOptions).toEqual({ anchorX: 0 })
		})
	})

	describe('handleTopDragOver', () => {
		const dragOverEvent = modifiers =>
			Object.assign(
				{
					preventDefault: () => {},
					dataTransfer: {},
					clientX: 0,
					clientY: 0,
				},
				modifiers,
			)

		const dropEffectFor = modifiers => {
			const backend = mockBackend()
			backend.dragOverTargetIds = [10]
			const e = dragOverEvent(modifiers)
			backend.handleTopDragOver(e)
			return e.dataTransfer.dropEffect
		}

		it('maps the event shift key onto dataTransfer.dropEffect', () => {
			expect(dropEffectFor({ shiftKey: true })).toBe('link')
		})

		it('maps the event ctrl key onto dataTransfer.dropEffect', () => {
			expect(dropEffectFor({ ctrlKey: true })).toBe('none')
		})

		it('maps the event alt key onto dataTransfer.dropEffect', () => {
			expect(dropEffectFor({ altKey: true })).toBe('copy')
		})

		it('falls back to move when no modifier key is held', () => {
			expect(dropEffectFor({})).toBe('move')
		})

		it('releasing a modifier key between dragover events restores move', () => {
			const backend = mockBackend()
			backend.dragOverTargetIds = [10]
			const withAlt = dragOverEvent({ altKey: true })
			backend.handleTopDragOver(withAlt)
			expect(withAlt.dataTransfer.dropEffect).toBe('copy')

			backend.dragOverTargetIds = [10]
			const withoutAlt = dragOverEvent({})
			backend.handleTopDragOver(withoutAlt)
			expect(withoutAlt.dataTransfer.dropEffect).toBe('move')
		})
	})
})
