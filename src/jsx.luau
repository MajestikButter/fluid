local ReflectionService = game:GetService("ReflectionService")
local action = require("@self/instances/action").create
local changed = require("@self/instances/changed")
local create = require("@self/instances/create")
local untrack = require("@self/reactive/untrack")

type Props = { [any]: any }

local IGNORED_CHANGE_PROPS = {
	AncestryChanged = true,
	AttributeChanged = true,
	AxisChanged = true,
	ButtonChanged = true,
	ControlPointChanged = true,
	EmotesChanged = true,
	HealthChanged = true,
	InputChanged = true,
	LightingChanged = true,
	SelectionChanged = true,
	StateChanged = true,
	ThemeChanged = true,
	ViewportChanged = true,
}

local lowerToClassName: { [string]: string } = {}
for _, class in ReflectionService:GetClasses() do
	lowerToClassName[string.lower(class.Name)] = class.Name
end

local function jsx(tag: string | (Props) -> any, props: Props, ...): any
	props = props or {}

	if type(tag) == "string" then
		tag = lowerToClassName[tag] or tag

		local actions = {}

		for key, value in props do
			if type(key) ~= "string" or IGNORED_CHANGE_PROPS[key] then
				continue
			end

			local property = string.match(key, "^(.+)Changed$")

			if property then
				table.insert(actions, changed(property, value))
				props[key] = nil
			end
		end

		for _, action in actions do
			table.insert(props, action)
		end

		if props.action then
			table.insert(props, action(props.action))
			props.action = nil
		end

		for index = 1, select("#", ...) do
			local child = select(index, ...)
			table.insert(props, child)
		end

		return create(tag)(props)
	end

	local count = select("#", ...)

	if count > 1 then
		props.children = { ... }
	elseif count == 1 then
		props.children = ...
	end

	return untrack(function()
		return tag(props)
	end)
end

return jsx
