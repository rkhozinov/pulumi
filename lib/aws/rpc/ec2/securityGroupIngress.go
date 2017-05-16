// *** WARNING: this file was generated by the Coconut IDL Compiler (CIDLC).  ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

package ec2

import (
    "errors"

    pbempty "github.com/golang/protobuf/ptypes/empty"
    pbstruct "github.com/golang/protobuf/ptypes/struct"
    "golang.org/x/net/context"

    "github.com/pulumi/coconut/pkg/resource"
    "github.com/pulumi/coconut/pkg/tokens"
    "github.com/pulumi/coconut/pkg/util/contract"
    "github.com/pulumi/coconut/pkg/util/mapper"
    "github.com/pulumi/coconut/sdk/go/pkg/cocorpc"
)

/* RPC stubs for SecurityGroupIngress resource provider */

// SecurityGroupIngressToken is the type token corresponding to the SecurityGroupIngress package type.
const SecurityGroupIngressToken = tokens.Type("aws:ec2/securityGroupIngress:SecurityGroupIngress")

// SecurityGroupIngressProviderOps is a pluggable interface for SecurityGroupIngress-related management functionality.
type SecurityGroupIngressProviderOps interface {
    Check(ctx context.Context, obj *SecurityGroupIngress) ([]mapper.FieldError, error)
    Create(ctx context.Context, obj *SecurityGroupIngress) (resource.ID, error)
    Get(ctx context.Context, id resource.ID) (*SecurityGroupIngress, error)
    InspectChange(ctx context.Context,
        id resource.ID, old *SecurityGroupIngress, new *SecurityGroupIngress, diff *resource.ObjectDiff) ([]string, error)
    Update(ctx context.Context,
        id resource.ID, old *SecurityGroupIngress, new *SecurityGroupIngress, diff *resource.ObjectDiff) error
    Delete(ctx context.Context, id resource.ID) error
}

// SecurityGroupIngressProvider is a dynamic gRPC-based plugin for managing SecurityGroupIngress resources.
type SecurityGroupIngressProvider struct {
    ops SecurityGroupIngressProviderOps
}

// NewSecurityGroupIngressProvider allocates a resource provider that delegates to a ops instance.
func NewSecurityGroupIngressProvider(ops SecurityGroupIngressProviderOps) cocorpc.ResourceProviderServer {
    contract.Assert(ops != nil)
    return &SecurityGroupIngressProvider{ops: ops}
}

func (p *SecurityGroupIngressProvider) Check(
    ctx context.Context, req *cocorpc.CheckRequest) (*cocorpc.CheckResponse, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    obj, _, decerr := p.Unmarshal(req.GetProperties())
    if decerr == nil || len(decerr.Failures()) == 0 {
        failures, err := p.ops.Check(ctx, obj)
        if err != nil {
            return nil, err
        }
        if len(failures) > 0 {
            decerr = mapper.NewDecodeErr(failures)
        }
    }
    return resource.NewCheckResponse(decerr), nil
}

func (p *SecurityGroupIngressProvider) Name(
    ctx context.Context, req *cocorpc.NameRequest) (*cocorpc.NameResponse, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    obj, _, decerr := p.Unmarshal(req.GetProperties())
    if decerr != nil {
        return nil, decerr
    }
    if obj.Name == "" {
        return nil, errors.New("Name property cannot be empty")
    }
    return &cocorpc.NameResponse{Name: obj.Name}, nil
}

func (p *SecurityGroupIngressProvider) Create(
    ctx context.Context, req *cocorpc.CreateRequest) (*cocorpc.CreateResponse, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    obj, _, decerr := p.Unmarshal(req.GetProperties())
    if decerr != nil {
        return nil, decerr
    }
    id, err := p.ops.Create(ctx, obj)
    if err != nil {
        return nil, err
    }
    return &cocorpc.CreateResponse{
        Id:   string(id),
    }, nil
}

func (p *SecurityGroupIngressProvider) Get(
    ctx context.Context, req *cocorpc.GetRequest) (*cocorpc.GetResponse, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    id := resource.ID(req.GetId())
    obj, err := p.ops.Get(ctx, id)
    if err != nil {
        return nil, err
    }
    return &cocorpc.GetResponse{
        Properties: resource.MarshalProperties(
            nil, resource.NewPropertyMap(obj), resource.MarshalOptions{}),
    }, nil
}

func (p *SecurityGroupIngressProvider) InspectChange(
    ctx context.Context, req *cocorpc.ChangeRequest) (*cocorpc.InspectChangeResponse, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    id := resource.ID(req.GetId())
    old, oldprops, decerr := p.Unmarshal(req.GetOlds())
    if decerr != nil {
        return nil, decerr
    }
    new, newprops, decerr := p.Unmarshal(req.GetNews())
    if decerr != nil {
        return nil, decerr
    }
    var replaces []string
    diff := oldprops.Diff(newprops)
    if diff != nil {
        if diff.Changed("name") {
            replaces = append(replaces, "name")
        }
        if diff.Changed("ipProtocol") {
            replaces = append(replaces, "ipProtocol")
        }
        if diff.Changed("cidrIp") {
            replaces = append(replaces, "cidrIp")
        }
        if diff.Changed("cidrIpv6") {
            replaces = append(replaces, "cidrIpv6")
        }
        if diff.Changed("fromPort") {
            replaces = append(replaces, "fromPort")
        }
        if diff.Changed("group") {
            replaces = append(replaces, "group")
        }
        if diff.Changed("groupName") {
            replaces = append(replaces, "groupName")
        }
        if diff.Changed("sourceSecurityGroup") {
            replaces = append(replaces, "sourceSecurityGroup")
        }
        if diff.Changed("sourceSecurityGroupName") {
            replaces = append(replaces, "sourceSecurityGroupName")
        }
        if diff.Changed("sourceSecurityGroupOwnerId") {
            replaces = append(replaces, "sourceSecurityGroupOwnerId")
        }
        if diff.Changed("toPort") {
            replaces = append(replaces, "toPort")
        }
    }
    more, err := p.ops.InspectChange(ctx, id, old, new, diff)
    if err != nil {
        return nil, err
    }
    return &cocorpc.InspectChangeResponse{
        Replaces: append(replaces, more...),
    }, err
}

func (p *SecurityGroupIngressProvider) Update(
    ctx context.Context, req *cocorpc.ChangeRequest) (*pbempty.Empty, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    id := resource.ID(req.GetId())
    old, oldprops, err := p.Unmarshal(req.GetOlds())
    if err != nil {
        return nil, err
    }
    new, newprops, err := p.Unmarshal(req.GetNews())
    if err != nil {
        return nil, err
    }
    diff := oldprops.Diff(newprops)
    if err := p.ops.Update(ctx, id, old, new, diff); err != nil {
        return nil, err
    }
    return &pbempty.Empty{}, nil
}

func (p *SecurityGroupIngressProvider) Delete(
    ctx context.Context, req *cocorpc.DeleteRequest) (*pbempty.Empty, error) {
    contract.Assert(req.GetType() == string(SecurityGroupIngressToken))
    id := resource.ID(req.GetId())
    if err := p.ops.Delete(ctx, id); err != nil {
        return nil, err
    }
    return &pbempty.Empty{}, nil
}

func (p *SecurityGroupIngressProvider) Unmarshal(
    v *pbstruct.Struct) (*SecurityGroupIngress, resource.PropertyMap, mapper.DecodeError) {
    var obj SecurityGroupIngress
    props := resource.UnmarshalProperties(v)
    result := mapper.MapIU(props.Mappable(), &obj)
    return &obj, props, result
}

/* Marshalable SecurityGroupIngress structure(s) */

// SecurityGroupIngress is a marshalable representation of its corresponding IDL type.
type SecurityGroupIngress struct {
    Name string `json:"name"`
    IPProtocol string `json:"ipProtocol"`
    CIDRIP *string `json:"cidrIp,omitempty"`
    CIDRIPv6 *string `json:"cidrIpv6,omitempty"`
    FromPort *float64 `json:"fromPort,omitempty"`
    Group *resource.ID `json:"group,omitempty"`
    GroupName *string `json:"groupName,omitempty"`
    SourceSecurityGroup *resource.ID `json:"sourceSecurityGroup,omitempty"`
    SourceSecurityGroupName *string `json:"sourceSecurityGroupName,omitempty"`
    SourceSecurityGroupOwnerId *string `json:"sourceSecurityGroupOwnerId,omitempty"`
    ToPort *float64 `json:"toPort,omitempty"`
}

// SecurityGroupIngress's properties have constants to make dealing with diffs and property bags easier.
const (
    SecurityGroupIngress_Name = "name"
    SecurityGroupIngress_IPProtocol = "ipProtocol"
    SecurityGroupIngress_CIDRIP = "cidrIp"
    SecurityGroupIngress_CIDRIPv6 = "cidrIpv6"
    SecurityGroupIngress_FromPort = "fromPort"
    SecurityGroupIngress_Group = "group"
    SecurityGroupIngress_GroupName = "groupName"
    SecurityGroupIngress_SourceSecurityGroup = "sourceSecurityGroup"
    SecurityGroupIngress_SourceSecurityGroupName = "sourceSecurityGroupName"
    SecurityGroupIngress_SourceSecurityGroupOwnerId = "sourceSecurityGroupOwnerId"
    SecurityGroupIngress_ToPort = "toPort"
)

