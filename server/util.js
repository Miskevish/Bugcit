export function parseListQuery(q = {}) {
  const page = Math.max(parseInt(q.page ?? "1", 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(q.pageSize ?? "10", 10) || 10, 1),
    100
  );
  const order = q.order === "DESC" ? -1 : 1;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, order, offset };
}
