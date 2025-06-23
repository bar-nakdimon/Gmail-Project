import ComposeButton from './ComposeButton';
import LabelList from './LabelList';
import '../../styles.css';

export default function Sidebar() {
  return (
        <aside className="sidebar">
        <ComposeButton />
        <LabelList />
      </aside>
  );
}
