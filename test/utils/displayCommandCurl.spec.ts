/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import { describe, it, expect } from "vitest";
import { displayCommandCurl } from "../../src/utils/displayCommandCurl.js";

const expectedCommandObject = `[{"options":[],"name":"create","description":"Create a new task.","contexts":[0],"type":1},{"options":[],"name":"update","description":"Update a task.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"task","description":"The task number.","required":true},{"type":3,"choices":[{"name":"Low","value":"low"},{"name":"Medium","value":"medium"},{"name":"High","value":"high"},{"name":"Critical","value":"critical"},{"name":"None","value":"none"}],"name":"priority","description":"The priority level.","required":true}],"name":"priority","description":"Set the priority of a task.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"task","description":"The task number.","required":true},{"type":3,"name":"tag","description":"The tag.","required":true}],"name":"tag","description":"Add or remove a tag from a task.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"task","description":"The task number.","required":true},{"name":"assignee","description":"The user to (un)assign.","required":true,"type":6}],"name":"assign","description":"Add or remove someone as a task assignee.","contexts":[0],"type":1},{"options":[{"type":3,"choices":[{"name":"Low","value":"low"},{"name":"Medium","value":"medium"},{"name":"High","value":"high"},{"name":"Critical","value":"critical"},{"name":"None","value":"none"}],"name":"priority","description":"List tasks under this priority.","required":false},{"type":3,"name":"tag","description":"List tasks with this tag.","required":false},{"name":"assignee","description":"List tasks assigned to this user.","required":false,"type":6},{"name":"completed","description":"List completed tasks.","required":false,"type":5}],"name":"list","description":"List all tasks, with optional filters.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"id","description":"The ID of the task to view.","required":true}],"name":"view","description":"View a task by its ID.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"id","description":"The ID of the task to complete.","required":true}],"name":"complete","description":"Mark a task as completed.","contexts":[0],"type":1},{"options":[{"min_value":1,"type":4,"name":"id","description":"The ID of the task to delete.","required":true}],"name":"delete","description":"Mark a task as deleted. WARNING: This will scrub all PII from the task and CANNOT be undone.","contexts":[0],"type":1}]`;

describe("display command curl", () => {
  it("should return the expected string", () => {
    expect.assertions(1);
    const string
      = displayCommandCurl({ discord: { user: { id: "123" } } } as never);

    expect(string, "did not return valid curl string").toBe(`curl -X PUT -H "Authorization: Bot {TOKEN}" -H "Content-Type: application/json" --data '${expectedCommandObject}' https://discord.com/api/v10/applications/123/commands`);
  });

  it("should handle the fallback ID", () => {
    expect.assertions(1);
    const string = displayCommandCurl({ discord: { user: {} } } as never);

    expect(string, "did not return valid curl string").toBe(`curl -X PUT -H "Authorization: Bot {TOKEN}" -H "Content-Type: application/json" --data '${expectedCommandObject}' https://discord.com/api/v10/applications/{ID}/commands`);
  });

  it("should include all commands in the payload", () => {
    expect.assertions(1);
    const string
    = displayCommandCurl({ discord: { user: { id: "123" } } } as never);
    expect(string, "missing create command").toContain("\"name\":\"create\"");
  });
});
