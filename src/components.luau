local indexes = require("./instances/for_keys")
local show = require("./utils/show")
local show_delay = require("./utils/show_delay")
local switch = require("./utils/switch")
local switch_delay = require("./utils/switch_delay")
local types = require("./reactive/types")
local values = require("./instances/for_values")

type Case = {
	match: any,
	children: () -> any,
}

type CaseDelay = {
	match: any,
	children: (active: types.Readable<boolean>) -> (any, number?),
}

local function Fragment(props: { children: any })
	return props.children
end

local function ForValue<K, V, R>(props: {
	each: types.UsedAs<{ [K]: V }>,
	children: (value: V, key: types.Readable<K>, active: types.Readable<boolean>) -> (R, number?),
}): () -> { R }
	return values(props.each, props.children)
end

local function ForIndex<K, V, R>(props: {
	each: types.UsedAs<{ [K]: V }>,
	children: (value: types.Readable<V>, key: K, active: types.Readable<boolean>) -> (R, number?),
}): () -> { R }
	return indexes(props.each, props.children)
end

local function Switch(props: {
	condition: () -> any,
	children: { Case },
})
	local children = props.children :: { [any]: any }
	local map = {}

	if children.match then
		map[children.match] = children.children
	else
		for _, node in children do
			map[node.match] = node.children
		end
	end

	return switch(props.condition)(map)
end

local function SwitchDelay(props: {
	condition: () -> any,
	children: { CaseDelay },
})
	local children = props.children :: { [any]: any }
	local map = {}

	if children.match then
		map[children.match] = children.children
	else
		for _, node in children do
			map[node.match] = node.children
		end
	end

	return switch_delay(props.condition)(map)
end

local function Case(props: Case): Case
	return props
end

local function CaseDelay(props: CaseDelay): CaseDelay
	return props
end

local function Show(props: {
	when: any,
	children: () -> any,
	fallback: () -> any,
})
	return show(props.when, props.children, props.fallback)
end

local function ShowDelay(props: {
	when: any,
	children: () -> (active: types.Readable<boolean>) -> (any, number?),
	fallback: () -> (active: types.Readable<boolean>) -> (any, number?),
})
	return show_delay(props.when, props.children, props.fallback)
end

return {
	Fragment = Fragment,
	Switch = Switch,
	Case = Case,
	SwitchDelay = SwitchDelay,
	CaseDelay = CaseDelay,
	ForValue = ForValue,
	ForIndex = ForIndex,
	Show = Show,
	ShowDelay = ShowDelay,
}
