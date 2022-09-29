import { validatePrTitle } from "./validatePrTitle";
const teams = ["GOS", "DNA"];
const ignoreLabels = ["ninja", "chore", "running with scissors", "fire"];
it("allows valid PR titles that use the default types", async () => {
  const inputs = [
    "DNA-1: Fix bug",
    "GOS-1!: Fix bug",
    "DNA-34879893: lalal",
    "DNA-666",
  ];

  for (let index = 0; index < inputs.length; index++) {
    await validatePrTitle(inputs[index], { teams, ignoreLabels });
  }
});

it("throws for PR titles without a ticket", async () => {
  await expect(
    validatePrTitle("Fix bug", { teams, ignoreLabels })
  ).rejects.toThrow('No ticket provided in pull request title "Fix bug"');
});
it("throws for PR titles without a ticket number", async () => {
  await expect(
    validatePrTitle("DNA: bug", { teams, ignoreLabels })
  ).rejects.toThrow('No ticket provided in pull request title "DNA: bug"');
});
it("throws for PR titles without a ticket number2", async () => {
  await expect(
    validatePrTitle("DNA-: bug", { teams, ignoreLabels })
  ).rejects.toThrow('No ticket provided in pull request title "DNA-: bug"');
});
it("throws for empty titles", async () => {
  await expect(validatePrTitle("", { teams, ignoreLabels })).rejects.toThrow(
    'No ticket provided in pull request title ""'
  );
});

it("works for PR titles with ticket presented not in start", async () => {
  await expect(
    validatePrTitle("doing stuff for salary DNA-123 lol", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});
it("works for PR titles with ticket number underscored", async () => {
  await expect(
    validatePrTitle("doing stuff for salary DNA_123 lol", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});
it("works for PR titles with ticket number spaced", async () => {
  await expect(
    validatePrTitle("doing stuff for salary DNA 123 lol", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});

it("doesnt throw if ignoreLabel ninja is in place", async () => {
  await expect(
    validatePrTitle("[ninja] they seee me merginn' they hatin'", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});

it("doesnt throw if ignoreLabel fire is in place", async () => {
  await expect(
    validatePrTitle("[fire] they seee me merginn' they hatin'", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});
it("doesnt throw if ignoreLabel running with scissors is in place", async () => {
  await expect(
    validatePrTitle(
      "[running with scissors] they seee me merginn' they hatin'",
      { teams, ignoreLabels }
    )
  ).resolves.toEqual(true);
});
it("doesnt throw if ignoreLabel chore is in place", async () => {
  await expect(
    validatePrTitle("[chore] they seee me merginn' they hatin'", {
      teams,
      ignoreLabels,
    })
  ).resolves.toEqual(true);
});
