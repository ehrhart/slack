const { Message } = require('.');

function shortSha(sha) {
  return sha.substring(0, 8);
}

class Push extends Message {
  constructor({ push }) {
    super({});
    this.push = push;
  }

  get summary() {
    const noOfCommits = this.push.commits.length;
    const commits = noOfCommits === 1 ? 'commit' : 'commits';
    const branch = this.push.ref.replace('refs/heads/', '');
    const branchUrl = `${this.push.repository.html_url}/tree/${branch}`;

    if (noOfCommits === 0 && this.push.forced) {
      const before = shortSha(this.push.before);
      const after = shortSha(this.push.after);
      return `force-pushed the <${branchUrl}|\`${branch}\`> branch from \`${before}\` to \`${after}\``;
    }

    const pushed = this.push.forced ? 'force-pushed' : 'pushed';
    return `<${this.push.compare}|${noOfCommits} new ${commits}> ${pushed} to <${branchUrl}|\`${branch}\`>`;
  }

  getRenderedMessage() {
    const attachments = this.push.commits.map(commit => ({
      footer: `*${commit.author.name}* committed on <${this.push.repository.html_url}|*${this.push.repository.full_name}*>`,
      text: `*<${commit.url}|\`${shortSha(commit.id)}\` ${commit.message.split('\n')[0]}>*\n${commit.message.split('\n').slice(1).join('\n')}`
    }));
    return {
      ...super.getBaseMessage(),
      fallback: `[${this.push.repository.full_name}] ${this.summary}`,
      text: `*${this.summary}*`,
      mrkdwn_in: ['text'],
      attachments,
    };
  }
}

module.exports = {
  Push,
};
