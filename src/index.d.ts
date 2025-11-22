type Key = string | number | symbol;

declare namespace Fluid {
	type Readable<T> = () => T;
	type Cleanup = () => void;
	type Effect<T> = (value: T) => T;
	type Callable<T> = (value: T) => void;
	type UsedAs<T> = T | Readable<T>;
	type Source<T> = ((value: T) => T) & Readable<T>;

	type AsyncState = "busy" | "ok";

	type Disposable =
		| Cleanup
		| Instance
		| RBXScriptConnection
		| { disconnect(): void }
		| { destroy(): void }
		| { Disconnect(): void }
		| { Destroy(): void };

	function create<K extends keyof CreatableInstances>(
		className: K
	): (props?: LegacyInstanceProps<CreatableInstances[K]>) => CreatableInstances[K];
	function create<T extends Instance>(instance: T): (props?: LegacyInstanceProps<T>) => T;

	function mount<T>(component: () => T, target: Instance): Cleanup;

	function tags(...tags: string[]): Action<any>;

	function bind<T extends Instance>(instance: T, props: InstanceAttributes<T>): T;

	function changed<T extends Instance, K extends keyof WritableInstanceProperties<T>>(
		key: K,
		callback: (value: WritableInstanceProperties<T>[K]) => void
	): Action<T>;

	function action<T extends Instance>(callback: (instance: T) => void, priority?: number): Action<T>;
	function is_action(value: any): value is Action<any>;

	function cleanup(value: Disposable): void;

	function derive<T>(source: Readable<T>): Readable<T>;

	function effect(callback: () => void): void;
	function effect<T>(callback: Effect<T>, initialValue: T): void;

	function deferred(callback: () => void): void;
	function deferred<T>(callback: () => T, initialValue: T): Readable<T>;

	function root<T extends unknown[]>(fn: (destroy: Cleanup) => LuaTuple<T>): LuaTuple<[Cleanup, ...T]>;
	function root<T>(fn: (destroy: Cleanup) => T): LuaTuple<[Cleanup, T]>;
	function root(fn: (destroy: Cleanup) => void): Cleanup;

	function source<T>(initialValue: T): Source<T>;
	function source<T>(): Source<T | undefined>;

	function untrack<T>(source: Source<T>): T;

	function interval<T>(func: (delta: number) => T, hz?: number, offset?: number): Readable<T>;

	/**
	 * async nodes creates a source node for the latest valid value and for the state.
	 * it also creates a reactive node which spawns a new thread that it runs under it's
	 * own scope.
	 *
	 * when created, the async node gets immediately evaluated similar to an effect.
	 * unlike an effect though, all evaluations are deferred since we make the assumption
	 * that async yields every single time.
	 */
	function async<T>(callback: (set: (value: T) => void) => T): LuaTuple<[Readable<T>, Readable<AsyncState>]>;

	function for_keys<V, R>(
		input: () => readonly V[],
		transform: (value: () => V, index: number) => R | LuaTuple<[R, number | undefined]>
	): () => R[];
	function for_keys<K, V, R>(
		input: () => Map<K, V> | ReadonlyMap<K, V>,
		transform: (value: () => V, key: K) => R | LuaTuple<[R, number | undefined]>
	): () => R[];
	function for_keys<K extends Key, V, R>(
		input: () => { readonly [P in K]: V },
		transform: (value: () => V, key: K) => R | LuaTuple<[R, number | undefined]>
	): () => R[];

	function for_values<V, R>(
		input: () => readonly V[],
		transform: (value: V, index: () => number) => R | LuaTuple<[R, number | undefined]>
	): () => R[];
	function for_values<K, V, R>(
		input: () => Map<K, V> | ReadonlyMap<K, V>,
		transform: (value: V, key: () => K) => R | LuaTuple<[R, number | undefined]>
	): () => R[];
	function for_values<K extends Key, V, R>(
		input: () => { readonly [P in K]: V },
		transform: (value: V, key: () => K) => R | LuaTuple<[R, number | undefined]>
	): () => R[];
	function read<T>(source: UsedAs<T>): T;

	function show<T, U = undefined>(source: () => any, component: () => T, fallback?: () => U): () => T | U;
	function show_delay<T, U = undefined>(source: () => any, component: () => T, fallback?: () => U): () => (T | U)[];

	// switch is a reserved keyword
	function match<T, U>(condition: () => T): (options: Map<T, UsedAs<U>>) => U;
	function match_delay<T, U>(
		condition: () => T
	): (options: Map<T, (value: Readable<boolean>) => U | LuaTuple<[U, number | undefined]>>) => () => U[];

	function lerp<T extends LerpAnimatable>(goal: UsedAs<T>, alpha: UsedAs<number>): Source<T>;
	function spring<T extends SpringAnimatable>(
		goal: UsedAs<T>,
		speed: UsedAs<number>,
		damping: UsedAs<number>
	): LuaTuple<[Readable<T>, (controls: SpringControls<T>) => void]>;

	let provide_scheduler: () => (delta: number) => void;

	function ForIndex<V, R>(props: {
		each: UsedAs<readonly V[]>;
		children: (value: Readable<V>, index: number, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];
	function ForIndex<K, V, R>(props: {
		each: UsedAs<Map<K, V> | ReadonlyMap<K, V>>;
		children: (value: Readable<V>, key: K, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];
	function ForIndex<K extends Key, V, R>(props: {
		each: UsedAs<{ readonly [P in K]: V }>;
		children: (value: Readable<V>, key: K, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];

	function ForValue<V, R>(props: {
		each: UsedAs<readonly V[]>;
		children: (value: V, index: Readable<number>, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];
	function ForValue<K, V, R>(props: {
		each: UsedAs<Map<K, V> | ReadonlyMap<K, V>>;
		children: (value: V, key: Readable<K>, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];
	function ForValue<K extends Key, V, R>(props: {
		each: UsedAs<{ readonly [P in K]: V }>;
		children: (value: V, key: Readable<K>, active: UsedAs<boolean>) => R | LuaTuple<[R, number | undefined]>;
	}): () => R[];

	function Case<T>(props: { match: T; children: () => Node | void }): Node;
	function CaseDelay<T>(props: {
		match: T;
		children: (active: UsedAs<boolean>) => Node | LuaTuple<[Node, number | undefined]>;
	}): Node;

	function Show(props: { when: UsedAs<any>; children: () => Node; fallback?: () => Node }): () => Node;
	function ShowDelay(props: {
		when: UsedAs<any>;
		children: () => Node | LuaTuple<[Node, number | undefined]>;
		fallback?: () => Node | LuaTuple<[Node, number | undefined]>;
	}): () => Node;

	type Action<T extends Instance> = {
		readonly __is_action: unique symbol;
		callback: (instance: T) => Cleanup | void;
		priority: number;
	};

	type SpringControls<T> = {
		position?: T;
		impulse?: T;
		velocity?: T;
	};

	type SpringAnimatable = Color3 | vector | UDim | UDim2 | number;
	type LerpAnimatable = number | Vector3 | Vector2 | Color3 | UDim | UDim2 | Rect;

	type Node = Instance | InstanceAttributes<Instance> | Action<any> | FragmentNode | FunctionNode | undefined;

	type LegacyNode<T extends Instance> =
		| Instance
		| InstanceAttributes<T>
		| Action<T>
		| FragmentNode
		| FunctionNode
		| undefined;

	type FragmentNode =
		| Map<number, Node>
		| ReadonlyMap<number, Node>
		| readonly Node[]
		| { readonly [key: number]: Node };

	type FunctionNode = () => Node;

	/**
	 * Attributes intrinsic to all JSX elements.
	 */
	interface Attributes {
		children?: Node;
	}

	/**
	 * Attributes including the `action` macro. Intrinsic to all JSX instances.
	 */
	interface ActionAttributes<T> extends Attributes {
		action?: (instance: T) => void;
	}

	/**
	 * Infers the names of the enum values from an enum item. Resolves to a union
	 * of the enum items and their respective names.
	 */
	type InferEnumNames<T> = T extends EnumItem ? T | T["Name"] : T;

	/**
	 * Instance properties that can be written to or assigned Vide sources.
	 */
	type InstancePropertySources<T extends Instance> = {
		[K in keyof WritableInstanceProperties<T>]?: UsedAs<InferEnumNames<WritableInstanceProperties<T>[K]>>;
	};

	/**
	 * Instance event properties that can be passed a callback function.
	 */
	type InstanceEventCallbacks<T extends Instance> = {
		[K in InstanceEventNames<T>]?: T[K] extends RBXScriptSignal<(...args: infer A) => void>
			? (...args: A) => void
			: never;
	};

	/**
	 * Instance property change events that can be passed a callback function.
	 * Internally, these are resolved to `changed()` actions.
	 */
	type InstanceChangedCallbacks<T extends Instance> = {
		[K in `${Extract<InstancePropertyNames<T>, string>}Changed`]?: K extends `${infer P extends Extract<InstancePropertyNames<T>, string>}Changed`
			? (value: T[P]) => void
			: never;
	};

	/**
	 * Instance events and property change events that can be passed a callback
	 * function. Property change events are a macro for `changed()` actions.
	 */
	type InstanceEventAttributes<T extends Instance> = InstanceEventCallbacks<T> & InstanceChangedCallbacks<T>;

	/**
	 * Instance properties and events that can be used with JSX syntax.
	 */
	type InstanceAttributes<T extends Instance> = ActionAttributes<T> &
		InstancePropertySources<T> &
		InstanceEventAttributes<T>;

	/**
	 * Instance properties and events that can be used with the
	 * legacy `create()` function.
	 */
	type LegacyInstanceProps<T extends Instance> = {
		[k in number]?: LegacyNode<T>;
	} & InstancePropertySources<T> &
		InstanceEventCallbacks<T>;
}

declare global {
	namespace JSX {
		type Element = Fluid.Node;
		type ElementType = string | ((props: any) => Element | void);

		interface IntrinsicAttributes extends Fluid.Attributes {}

		interface ElementChildrenAttribute {
			children: {};
		}

		type IntrinsicElements = {
			[K in keyof Instances as Lowercase<K>]: Instances[K] extends Instance
				? Fluid.InstanceAttributes<Instances[K]>
				: never;
		};
	}
}

export = Fluid;
export as namespace Fluid;
