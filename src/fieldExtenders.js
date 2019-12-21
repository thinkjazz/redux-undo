/*

Field extenders would do just that, add extra fields to state that would extend functionality
A commonly requested field is an `actionType` field with the last stored action type
This would be perfect for that use case
Field extenders would be added to an undoable function like so

*/

undoable(myReducer, {
  fieldExtenders: [
    actionTypeField(),
    customFieldExtender()
  ]
})

// The implementation of field extenders is reminiscent of express middleware

const customFieldExtender = (extenderConfig) => {
  // Configure the extender (optional)

  return (nextReducer, undoableConfig) => {
    // `nextReducer` is the next field extender or the wrapped undoable reducer

    // You can access the `undoableConfig` if you wanted behavior
    // dependent on it like using `undoableConfig.initTypes` for example

    return (history, action) => {
      // This is the function that is called every action dispatch

      let newHistory = { ...history }
      newHistory.extraField = 'something'

      return nextReducer(newHistory, action)
    }
  }
}





// Here are a few examples that might be interesting

const actionTypeField = (ignoreActions) => {
  const ignored = ignoreActions || (() => false)

  return (nextReducer, config) => {
    return (state, action) => {
      const newState = {...state}
      if (!ignored(action)) {
        newState.actionType = action.type
      }

      return nextReducer(newState, action)
    }
  }
}

const flattenState = () => {
  return (nextReducer, config) => {
    return (state, action) => {
      return nextReducer(
        {
          ...state,
          ...state.present
        },
        action
      )
    }
  }
}

// I don't know how much I like this one, but it would answer issue #237

const nullifyFields = (fields = ['fieldName', 'secondField'], nullValue = null) => {

  const removeFields = (state) => {
    if (!state) return state

    for (let toNullify of fields) {
      state[toNullify] = nullValue
    }
  }

  return (nextReducer, config) => {
    const { redoType } = config

    return (state, action) => {
      const newState = {...state}

      if (action.type === redoType) {
        removeFields(newState.future[0])
      } else {
        removeFields(state.past[state.length - 1])
      }

      return nextReducer(newState, action)
    }
  }
}
