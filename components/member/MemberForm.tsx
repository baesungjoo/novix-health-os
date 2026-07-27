'use client';

import { Button, Input, Modal, TextArea } from '../ui';
import { Member } from '@/lib/demo-data';

interface MemberFormProps {
  isOpen: boolean;
  editing: Member | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function MemberForm({
  isOpen,
  editing,
  saving,
  onClose,
  onSubmit,
}: MemberFormProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={editing ? '회원 정보 수정' : '신규 회원 등록'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="form">
        <Input label="이름" name="name" defaultValue={editing?.name} required />

        <Input
          label="연락처"
          name="phone"
          defaultValue={editing?.phone}
          placeholder="010-0000-0000"
          required
        />

        <Input
          label="생년월일"
          name="birthday"
          type="date"
          defaultValue={editing?.birthday}
          required
        />

        <Input
          label="관심 분야"
          name="interest"
          defaultValue={editing?.interest}
          placeholder="예: 허리·관절"
        />

        <TextArea label="메모" name="memo" defaultValue={editing?.memo} />

        <Button variant="primary" isLoading={saving} type="submit">
          {saving ? '저장 중...' : editing ? '수정 내용 저장' : '회원 등록'}
        </Button>
      </form>
    </Modal>
  );
}
