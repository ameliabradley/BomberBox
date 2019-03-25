export default (state, action) => {
  switch (action.type) {
    case 'PLAYER_WEAPON_SET':
      return state.map((weapon, i) => {
        return {
          ...weapon,
          selected: (action.selected === i)
        }
      });
      break;

    case 'PLAYER_WEAPON_ADD': {
      const { id, name } = action;
      return [
        ...state,
        {
          id,
          name,
          selected: false,
        },
      ];
      break;
    }

    case 'PLAYER_WEAPON_REMOVE': {
      return state.filter(weapon => weapon.id !== action.id);
    }

    case 'PLAYER_WEAPON_SET_COOLDOWN': {
      const { cooldown, slotIndex } = action;
      const weapons = [ ...state ];
      weapons[slotIndex] = {
        ...weapons[slotIndex],
        cooldown
      }
      return weapons;
    }

    default:
      return [];
  }
}
