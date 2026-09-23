-- 시연 전 초기화: 반응/매칭/신고/차단/후기 기록을 지우고
-- 모든 물건을 다시 available 상태로 되돌린다. (물건 자체는 삭제 안 함)
delete from reviews;
delete from reports;
delete from blocks;
delete from matches;
delete from reactions;
update items set status = 'available';
