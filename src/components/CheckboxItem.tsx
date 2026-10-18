import { Checkbox } from 'expo-checkbox';
import React, { useState, type ReactNode } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface CheckBoxModel {
  children?: CheckBoxModel[];
  value: string;
  label: string;
  icon?: ReactNode;
}

interface Props {
  item: CheckBoxModel;
  onSelect: (val: string) => void;
  selected: string[];
  expandedIcon?: ReactNode;
  unExpandedIcon?: ReactNode;
  checkedColor?: string;
  unCheckedColor?: string;
  textStyle?: StyleProp<TextStyle>;
  labelColor?: string;
  styles?: StyleProp<ViewStyle>;
}

const hasChildren = (node: CheckBoxModel): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

const countLeaves = (node: CheckBoxModel): number =>
  hasChildren(node)
    ? node.children!.reduce((total, child) => total + countLeaves(child), 0)
    : 1;

const countSelectedLeaves = (node: CheckBoxModel, selected: string[]): number =>
  hasChildren(node)
    ? node.children!.reduce(
        (total, child) => total + countSelectedLeaves(child, selected),
        0
      )
    : selected.includes(node.value)
      ? 1
      : 0;

const collectLeafValues = (node: CheckBoxModel): string[] =>
  hasChildren(node)
    ? node.children!.flatMap(collectLeafValues)
    : [node.value];

const isNodeChecked = (node: CheckBoxModel, selected: string[]): boolean =>
  hasChildren(node)
    ? countSelectedLeaves(node, selected) === countLeaves(node)
    : selected.includes(node.value);

const CheckboxItem = (props: Props) => {
  const {
    item,
    onSelect,
    selected,
    expandedIcon,
    unExpandedIcon,
    checkedColor,
    unCheckedColor,
    textStyle,
    styles,
    labelColor,
  } = props;
  const [collapsed, setCollapsed] = useState(false);

  const handleCheck = (node: CheckBoxModel) => {
    collectLeafValues(node).forEach((value) => onSelect(value));
  };

  return (
    <View key={item.value}>
      <View
        style={[
          { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
          styles,
        ]}
      >
        {hasChildren(item) ? (
          <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
            {collapsed
              ? (expandedIcon ?? <></>)
              : (unExpandedIcon ?? <></>)}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 16 }} />
        )}
        <TouchableOpacity
          onPress={() => handleCheck(item)}
          style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
        >
          <Checkbox
            color={checkedColor ?? '#1abc9c'}
            onValueChange={() => handleCheck(item)}
            value={isNodeChecked(item, selected)}
          />
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {item.icon && item.icon}
            <Text
              style={[
                {
                  color: labelColor ?? '#212121',
                  marginLeft: item.icon ? 8 : 0,
                },
                textStyle,
              ]}
            >
              {item.label}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {collapsed && hasChildren(item) && (
        <View>
          {item.children!.map((child) => (
            <View style={{ marginLeft: 24 }} key={child.value}>
              <CheckboxItem
                item={child}
                onSelect={onSelect}
                selected={selected}
                unCheckedColor={unCheckedColor}
                expandedIcon={expandedIcon}
                checkedColor={checkedColor}
                unExpandedIcon={unExpandedIcon}
                textStyle={textStyle}
                styles={styles}
                labelColor={labelColor}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default CheckboxItem;