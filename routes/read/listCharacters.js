const { getProfileObjects } = require('../../utils/getProfileObjects');

module.exports = async function listCharacters(req, res) {
  const { serverId } = req.params;
  const {
    q = '',           // 검색(IGN/디코닉/직업/직업군)
    group = '',       // 본계정|부계정|버프캐
    sort = 'order',   // order|level|atk|bossDmg
    dir = 'asc',      // asc|desc
    page = '1',
    pageSize = '30',
  } = req.query;

  try {
    let list = await getProfileObjects(serverId);

    const s = String(q).trim().toLowerCase();
    if (s) {
      list = list.filter(x =>
        (x.ign && x.ign.toLowerCase().includes(s)) ||
        (x.nicknameValue && x.nicknameValue.toLowerCase().includes(s)) ||
        (x.job && x.job.toLowerCase().includes(s)) ||
        (x.jobGroup && x.jobGroup.toLowerCase().includes(s))
      );
    }

    if (group) list = list.filter(x => x.accountGroup === group);

    const key = ['order','level','atk','bossDmg'].includes(sort) ? sort : 'order';
    const asc = dir !== 'desc';
    list.sort((a, b) => {
      const va = a[key] ?? 0, vb = b[key] ?? 0;
      return asc ? va - vb : vb - va;
    });

    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 30));
    const total = list.length;
    const start = (p - 1) * ps;
    const items = list.slice(start, start + ps);

    res.json({ total, page: p, pageSize: ps, items });
  } catch (err) {
    console.error('listCharacters error:', err);
    res.status(500).json({ error: '전체 조회 중 오류' });
  }
};
