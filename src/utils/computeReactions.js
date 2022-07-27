export default function conputeReactions(message) {
  if (!message || !message.reactions || message.reactions.length === 0) return;
  let finalReactions = [];
  message.reactions.forEach((reaction) => {
    if (finalReactions.length === 0)
      finalReactions.push({
        reaction: reaction.reaction,
        label: reaction.label,
        reactors: [reaction.user],
      });
    else {
      const reactionIndex = finalReactions.findIndex(
        (react) => react.label === reaction.label
      );
      if (reactionIndex === -1)
        finalReactions.push({
          reaction: reaction.reaction,
          label: reaction.label,
          reactors: [reaction.user],
        });
      else finalReactions[reactionIndex].reactors.push(reaction.user);
    }
  });
  return finalReactions;
  // return final reactions
}
