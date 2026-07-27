import { Pencil, Trash2 } from 'lucide-react';
import { Badge, Card, IconButton, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../ui';
import { Member } from '@/lib/demo-data';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberTableProps {
  members: Member[];
  loading: boolean;
  selectedMemberId: number | null;
  onSelect: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export function MemberTable({
  members,
  loading,
  selectedMemberId,
  onSelect,
  onEdit,
  onDelete,
}: MemberTableProps) {
  return (
    <Card className="table-wrap" style={{ padding: 0 }}>
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell>회원명</TableHeaderCell>
            <TableHeaderCell>연락처</TableHeaderCell>
            <TableHeaderCell>생년월일</TableHeaderCell>
            <TableHeaderCell>방문</TableHeaderCell>
            <TableHeaderCell>상태</TableHeaderCell>
            <TableHeaderCell>관심 분야</TableHeaderCell>
            <TableHeaderCell>메모</TableHeaderCell>
            <TableHeaderCell>관리</TableHeaderCell>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="empty">
                회원 정보를 불러오는 중입니다.
              </TableCell>
            </TableRow>
          ) : members.length ? (
            members.map((member) => (
              <TableRow
                key={member.id}
                onClick={() => onSelect(member)}
                className={`member-row ${selectedMemberId === member.id ? 'selected' : ''}`}
              >
                <TableCell>
                  <b>{member.name}</b>
                </TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.birthday}</TableCell>
                <TableCell>{member.visits}회</TableCell>
                <TableCell>
                  <MemberStatusBadge visits={member.visits} />
                </TableCell>
                <TableCell>
                  <Badge>{member.interest || '미입력'}</Badge>
                </TableCell>
                <TableCell>{member.memo || '-'}</TableCell>
                <TableCell>
                  <div className="actions">
                    <IconButton
                      icon={<Pencil size={16} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(member);
                      }}
                      title="수정"
                    />

                    <IconButton
                      variant="danger"
                      icon={<Trash2 size={16} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(member);
                      }}
                      title="삭제"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="empty">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
