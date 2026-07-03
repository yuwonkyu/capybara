const copyButton = document.getElementById("copyInvite");
const inviteTag = document.getElementById("inviteTag");

if (copyButton && inviteTag) {
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(inviteTag.textContent.trim());
      const originalText = copyButton.textContent;
      copyButton.textContent = "복사 완료";
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 1300);
    } catch (error) {
      copyButton.textContent = "복사 실패";
    }
  });
}
