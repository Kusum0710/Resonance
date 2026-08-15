import { HomeIcon, ReflectionsIcon, SettingsIcon } from './icons';
import './BottomNav.css';

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'reflections', label: 'Reflections', Icon: ReflectionsIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export default function BottomNav({ active = 'home', onChange = () => {} }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            className={`nav-item${isActive ? ' nav-item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(id)}
          >
            <span className="nav-item__pill">
              <Icon />
              <span className="nav-item__label">{label}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}