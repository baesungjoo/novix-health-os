import { Search, Plus } from 'lucide-react';
import { Button } from '../ui';

interface MemberToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
}

export function MemberToolbar({
  query,
  onQueryChange,
  onCreate,
}: MemberToolbarProps) {
  return (
    <div className="toolbar">
      <div className="search">
        <Search size={18} />
        <input
          placeholder="이름, 전화번호, 관심 분야 검색"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <Button variant="primary" icon={<Plus size={17} />} onClick={onCreate}>
        회원 등록
      </Button>
    </div>
  );
}
