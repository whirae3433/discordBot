function mapRow(row = []) {
  return {
    discordId: row[0] || '',
    id: row[1] || '',
    profileImg: row[2] || '',
    nicknameValue: row[3] || '',
    ign: row[4] || '',
    accountGroup: row[5] || '',
    order: Number(row[6] || 0),
    level: Number(row[7] || 0),
    hp: Number(row[8] || 0),
    acc: Number(row[9] || 0),
    job: row[10] || '',
    atk: Number(row[11] || 0),
    bossDmg: Number(row[12] || 0),
    mapleWarrior: row[13] || 0,
    regDate: row[14] || '',
  };
}

module.exports = { mapRow };
