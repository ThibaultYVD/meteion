function isCurrentUserIsAdmin(currentUserId, eventUserId) {
  return (eventUserId === currentUserId ||
    currentUserId === process.env.SUPERADMIN1);
}

module.exports = {
  isCurrentUserIsAdmin,
};
