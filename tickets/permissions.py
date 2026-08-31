from rest_framework import permissions

# Supervisor: sab kuch access kar sakta hai
class IsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'SUPERVISOR'
        )

# Agent: sirf assigned tickets ya jisme wo collaborator hai, unhi ko access kar sakta hai
class IsAssigneeOrCollaboratorOrSupervisor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # Supervisor can do anything
        if hasattr(request.user, 'profile') and request.user.profile.role == 'SUPERVISOR':
            return True

        # Agents can only access if they are primary assignee or collaborator
        is_assignee = obj.primary_assignee == request.user
        is_collaborator = request.user in obj.collaborators.all()
        return is_assignee or is_collaborator